import { useEffect, useMemo, useRef, useState } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import ukHomeNations from '../../data/ukHomeNations.json'
import {
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { aggregateByGeoName } from '../../utils/countryGeo'
import { getMajorCities } from '../../utils/majorCities'
import EmptyChartState from './EmptyChartState'

// Fraction of the viewport the focused country should fill (leaving a small
// margin around it). Lower = more breathing room around the country shape.
const COUNTRY_FIT_PADDING = 0.82

const WIDTH = 960
const HEIGHT = 500
const MIN_SCALE = 1
const MAX_SCALE = 40

// Compute geographies once at module load.
// We drop the world-atlas "United Kingdom" polygon and replace it with four
// separate home-nation polygons (England, Scotland, Wales, Northern Ireland)
// from src/data/ukHomeNations.json — each home nation has its own football
// league, so shading them individually is more meaningful for collectors.
const UK_HOME_NATION_NAMES = new Set(
  ukHomeNations.features.map((f) => f.properties.name)
)

const COUNTRIES = [
  ...feature(worldData, worldData.objects.countries).features.filter(
    (geo) =>
      geo.properties.name !== 'Antarctica' &&
      geo.properties.name !== 'United Kingdom'
  ),
  ...ukHomeNations.features,
]

const projection = geoEqualEarth()
projection.fitSize([WIDTH, HEIGHT - 20], {
  type: 'FeatureCollection',
  features: COUNTRIES,
})

const pathGenerator = geoPath(projection)
const COUNTRY_PATHS = COUNTRIES.map((geo) => ({
  id: geo.id ?? `uk-${geo.properties.name}`,
  name: geo.properties.name,
  d: pathGenerator(geo),
  // Pre-compute the projected centroid (in viewBox units) — used when we
  // auto-zoom to a clicked country.
  centroid: pathGenerator.centroid(geo),
  bounds: pathGenerator.bounds(geo),
  isUKHomeNation: UK_HOME_NATION_NAMES.has(geo.properties.name),
})).filter((c) => c.d)

function getFill(count) {
  if (!count) return '#f3f4f6'
  if (count >= 10) return '#15803d'
  if (count >= 7) return '#16a34a'
  if (count >= 4) return '#34d399'
  if (count >= 2) return '#6ee7b7'
  return '#bbf7d0'
}

const DEFAULT_TRANSFORM = { tx: 0, ty: 0, scale: 1 }

function clampTransform(tx, ty, scale) {
  const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
  const minTx = -WIDTH * (clampedScale - 1)
  const minTy = -HEIGHT * (clampedScale - 1)
  return {
    tx: Math.min(0, Math.max(minTx, tx)),
    ty: Math.min(0, Math.max(minTy, ty)),
    scale: clampedScale,
  }
}

function zoomAround(prev, cursorX, cursorY, factor) {
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
  const localX = (cursorX - prev.tx) / prev.scale
  const localY = (cursorY - prev.ty) / prev.scale
  const newTx = cursorX - localX * newScale
  const newTy = cursorY - localY * newScale
  return clampTransform(newTx, newTy, newScale)
}

export default function InternationalMap({
  byCountry,
  clubPins,
  emptyMessage,
  expandable = true,
  title,
}) {
  const [hovered, setHovered] = useState(null)
  const [hoveredPin, setHoveredPin] = useState(null)
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  // The world-atlas polygon name of the country currently focused for pins.
  // Only meaningful when clubPins is set (i.e. club map view).
  const [selectedGeoCountry, setSelectedGeoCountry] = useState(null)
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  // Was the last mouse-up the end of an actual drag? If so, the click event
  // that follows should NOT be treated as a country selection.
  const dragJustEndedRef = useRef(false)
  // Stable handler refs so we can register native event listeners with
  // passive:false without re-binding on every state change.
  const wheelHandlerRef = useRef(null)

  const countryToCount = useMemo(() => aggregateByGeoName(byCountry || []), [byCountry])
  const totalKits = useMemo(
    () => Array.from(countryToCount.values()).reduce((s, v) => s + v, 0),
    [countryToCount]
  )

  // World coverage: count distinct polygons the user owns kits from, over
  // total polygons on the map (world-atlas countries minus Antarctica/UK,
  // plus the four UK home nations). Aggregates only resolved polygon names.
  const percentCovered = useMemo(() => {
    if (COUNTRY_PATHS.length === 0) return 0
    const matched = Array.from(countryToCount.keys()).filter((name) =>
      COUNTRY_PATHS.some((c) => c.name === name)
    ).length
    return (matched / COUNTRY_PATHS.length) * 100
  }, [countryToCount])

  const percentDisplay =
    percentCovered === 0
      ? '0'
      : percentCovered < 10
        ? percentCovered.toFixed(1)
        : Math.round(percentCovered).toString()

  // Group pins by world-atlas polygon name so we can look them up on click.
  const pinsByGeoCountry = useMemo(() => {
    const map = new Map()
    for (const pin of clubPins || []) {
      if (!pin.geoCountry) continue
      const list = map.get(pin.geoCountry) || []
      list.push(pin)
      map.set(pin.geoCountry, list)
    }
    return map
  }, [clubPins])

  const activePins = selectedGeoCountry
    ? pinsByGeoCountry.get(selectedGeoCountry) || []
    : []

  // Major cities for orientation when a country is focused. Suppress entries
  // whose city name already appears as a club pin so we don't stack two dots
  // at the same point.
  const activeMajorCities = useMemo(() => {
    if (!selectedGeoCountry) return []
    const clubCityNames = new Set(activePins.map((p) => p.city?.toLowerCase()))
    return getMajorCities(selectedGeoCountry).filter(
      (c) => !clubCityNames.has(c.name.toLowerCase())
    )
  }, [selectedGeoCountry, activePins])

  // Reset selection if the map's data context changes (e.g. user switches
  // from club view to international view).
  useEffect(() => {
    setSelectedGeoCountry(null)
    setHoveredPin(null)
  }, [clubPins])

  // Convert client (px) coords to SVG viewBox coords.
  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  // Wheel zoom around cursor. React's synthetic onWheel is passive by default
  // (it warns on preventDefault), so we register a native listener instead.
  wheelHandlerRef.current = (e) => {
    e.preventDefault()
    const { x, y } = clientToViewBox(e.clientX, e.clientY)
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2
    setTransform((prev) => zoomAround(prev, x, y, factor))
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const fn = (e) => wheelHandlerRef.current?.(e)
    svg.addEventListener('wheel', fn, { passive: false })
    return () => svg.removeEventListener('wheel', fn)
  }, [])

  // ESC closes the expand modal.
  useEffect(() => {
    if (!isExpanded) return
    const onKey = (e) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isExpanded])

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    // Block native text/element drag-selection — it intercepts subsequent
    // mousemove events and pan stops working.
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: transform.tx,
      startTy: transform.ty,
      moved: false,
    }
    setHovered(null)
  }

  const handleMouseMove = (e) => {
    if (dragRef.current) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scaleX = WIDTH / rect.width
      const scaleY = HEIGHT / rect.height
      const dx = (e.clientX - dragRef.current.startX) * scaleX
      const dy = (e.clientY - dragRef.current.startY) * scaleY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragRef.current.moved = true
      }
      setTransform((prev) =>
        clampTransform(
          dragRef.current.startTx + dx,
          dragRef.current.startTy + dy,
          prev.scale
        )
      )
    }
  }

  const handleMouseUp = () => {
    if (dragRef.current) {
      dragJustEndedRef.current = dragRef.current.moved === true
      dragRef.current = null
      setIsDragging(false)
    }
  }

  // Zoom and pan so the country's bounding box fills the viewport with a
  // small margin. Tiny countries hit MAX_SCALE (clamped); huge countries
  // (Russia, Canada) settle near scale=1.
  const focusCountry = (country) => {
    const [[x0, y0], [x1, y1]] = country.bounds
    const w = x1 - x0
    const h = y1 - y0
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return
    const fitScale = Math.min(WIDTH / w, HEIGHT / h) * COUNTRY_FIT_PADDING
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fitScale))
    const midX = (x0 + x1) / 2
    const midY = (y0 + y1) / 2
    const tx = WIDTH / 2 - midX * scale
    const ty = HEIGHT / 2 - midY * scale
    setTransform(() => clampTransform(tx, ty, scale))
  }

  const handleCountryClick = (country) => {
    // Distinguish a drag-release from a real click on the country.
    if (dragJustEndedRef.current) {
      dragJustEndedRef.current = false
      return
    }
    // Click-to-pin only makes sense in club view, and only for countries the
    // user actually has kits from.
    if (!clubPins) return
    const pins = pinsByGeoCountry.get(country.name) || []
    if (pins.length === 0) return
    if (selectedGeoCountry === country.name) {
      // Second click on the same country clears the focus.
      setSelectedGeoCountry(null)
      setHoveredPin(null)
      return
    }
    setSelectedGeoCountry(country.name)
    setHoveredPin(null)
    focusCountry(country)
  }

  // Click on empty map area clears any active country selection.
  const handleBackgroundClick = () => {
    if (dragJustEndedRef.current) {
      dragJustEndedRef.current = false
      return
    }
    if (selectedGeoCountry) {
      setSelectedGeoCountry(null)
      setHoveredPin(null)
    }
  }

  const handleCountryMove = (e, country) => {
    if (dragRef.current) return // suppress tooltip while panning
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHovered({
      name: country.name,
      count: countryToCount.get(country.name) || 0,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const zoomBy = (factor) => {
    const cx = WIDTH / 2
    const cy = HEIGHT / 2
    setTransform((prev) => zoomAround(prev, cx, cy, factor))
  }

  const resetView = () => {
    setTransform(DEFAULT_TRANSFORM)
    setSelectedGeoCountry(null)
    setHoveredPin(null)
  }

  const handlePinMove = (e, pin) => {
    if (dragRef.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHoveredPin({
      pin,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  if (!byCountry?.length) {
    return (
      <EmptyChartState
        message={emptyMessage || "Add international kits to map where you've collected from."}
      />
    )
  }

  return (
    <>
    <div
      className="intl-map"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="World map showing countries you've collected kits from"
        className="intl-map__svg"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="#f8fafc"
          onClick={handleBackgroundClick}
        />
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
          {COUNTRY_PATHS.map((country) => {
            const count = countryToCount.get(country.name) || 0
            const hasPins = clubPins && (pinsByGeoCountry.get(country.name)?.length || 0) > 0
            const isSelected = selectedGeoCountry === country.name
            let cls = 'intl-map__country'
            if (count > 0) cls += ' intl-map__country--owned'
            if (hasPins) cls += ' intl-map__country--clickable'
            if (isSelected) cls += ' intl-map__country--selected'
            return (
              <path
                key={country.id}
                d={country.d}
                fill={getFill(count)}
                stroke={isSelected ? '#111827' : '#ffffff'}
                strokeWidth={(isSelected ? 1.25 : 0.5) / transform.scale}
                className={cls}
                onMouseMove={(e) => handleCountryMove(e, country)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleCountryClick(country)}
              />
            )
          })}

          {activeMajorCities.map((city, i) => {
            const projected = projection([city.lng, city.lat])
            if (!projected) return null
            const [px, py] = projected
            const r = 3.5 / transform.scale
            const fontSize = 14 / transform.scale
            const strokeWidth = 3 / transform.scale
            return (
              <g key={`major-${selectedGeoCountry}-${i}`} className="intl-map__major-city">
                <circle
                  cx={px}
                  cy={py}
                  r={r}
                  fill="#6b7280"
                  stroke="#ffffff"
                  strokeWidth={0.75 / transform.scale}
                />
                <text
                  x={px + r * 2.2}
                  y={py + fontSize * 0.35}
                  fontSize={fontSize}
                  fill="#374151"
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                  paintOrder="stroke"
                  className="intl-map__major-city-label"
                >
                  {city.name}
                </text>
              </g>
            )
          })}

          {activePins.map((pin, i) => {
            const projected = projection([pin.lng, pin.lat])
            if (!projected) return null
            const [px, py] = projected
            // All pin geometry is inverse-scaled so the pin stays visually
            // constant in viewport pixels regardless of how far the user
            // has zoomed in.
            const s = 1 / transform.scale
            const r = 7 * s              // bulb radius
            const tailH = 11 * s         // distance from tip to bulb center bottom
            const fontSize = 16 * s
            const labelStroke = 3.5 * s
            const delay = `${i * 70}ms`
            return (
              <g
                key={`${pin.country}|${pin.team}|${i}`}
                className="intl-map__pin"
                transform={`translate(${px} ${py})`}
                onMouseMove={(e) => handlePinMove(e, pin)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                <ellipse
                  cx={0}
                  cy={2 * s}
                  rx={r * 0.7}
                  ry={r * 0.22}
                  fill="rgba(0,0,0,0.28)"
                  className="intl-map__pin-shadow"
                  style={{ animationDelay: `calc(${delay} + 220ms)` }}
                />
                <g
                  className="intl-map__pin-drop"
                  style={{ animationDelay: delay }}
                >
                  <path
                    d={`M ${-r * 0.7} ${-tailH} L 0 0 L ${r * 0.7} ${-tailH} Z`}
                    fill="#dc2626"
                  />
                  <circle
                    cx={0}
                    cy={-tailH - r * 0.5}
                    r={r}
                    fill="#dc2626"
                    stroke="#ffffff"
                    strokeWidth={r * 0.25}
                  />
                  <circle
                    cx={0}
                    cy={-tailH - r * 0.5}
                    r={r * 0.38}
                    fill="#ffffff"
                  />
                </g>
                <text
                  x={r * 1.1}
                  y={fontSize * 0.35}
                  fontSize={fontSize}
                  fill="#111827"
                  stroke="#ffffff"
                  strokeWidth={labelStroke}
                  paintOrder="stroke"
                  fontWeight={600}
                  className="intl-map__pin-label"
                  style={{ animationDelay: `calc(${delay} + 280ms)` }}
                >
                  {pin.city}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      <div className="intl-map__zoom-controls">
        <button
          type="button"
          className="intl-map__zoom-btn"
          onClick={() => zoomBy(1.5)}
          disabled={transform.scale >= MAX_SCALE}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <PlusIcon className="intl-map__zoom-icon" />
        </button>
        <button
          type="button"
          className="intl-map__zoom-btn"
          onClick={() => zoomBy(1 / 1.5)}
          disabled={transform.scale <= MIN_SCALE}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <MinusIcon className="intl-map__zoom-icon" />
        </button>
        <button
          type="button"
          className="intl-map__zoom-btn"
          onClick={resetView}
          disabled={transform.scale === 1 && transform.tx === 0 && transform.ty === 0}
          aria-label="Reset view"
          title="Reset view"
        >
          <ArrowsPointingOutIcon className="intl-map__zoom-icon" />
        </button>
        {expandable && (
          <button
            type="button"
            className="intl-map__zoom-btn"
            onClick={() => setIsExpanded(true)}
            aria-label="Open large map"
            title="Open large map"
          >
            <ArrowTopRightOnSquareIcon className="intl-map__zoom-icon" />
          </button>
        )}
      </div>

      {hovered && !hoveredPin && (
        <div
          className="intl-map__tooltip"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          <p className="intl-map__tooltip-name">{hovered.name}</p>
          <p className="intl-map__tooltip-count">
            {hovered.count > 0
              ? `${hovered.count} ${hovered.count === 1 ? 'kit' : 'kits'}`
              : 'No kits yet'}
          </p>
          {clubPins && (pinsByGeoCountry.get(hovered.name)?.length || 0) > 0 && (
            <p className="intl-map__tooltip-hint">
              {selectedGeoCountry === hovered.name ? 'Click to clear' : 'Click to drop pins'}
            </p>
          )}
        </div>
      )}

      {hoveredPin && (
        <div
          className="intl-map__tooltip"
          style={{ left: hoveredPin.x + 12, top: hoveredPin.y + 12 }}
        >
          <p className="intl-map__tooltip-name">{hoveredPin.pin.team}</p>
          <p className="intl-map__tooltip-count">
            {hoveredPin.pin.city} · {hoveredPin.pin.count}{' '}
            {hoveredPin.pin.count === 1 ? 'kit' : 'kits'}
          </p>
        </div>
      )}

      <div className="intl-map__legend">
        <span className="intl-map__legend-label">Fewer</span>
        <div className="intl-map__legend-swatches">
          <span style={{ background: '#bbf7d0' }} />
          <span style={{ background: '#6ee7b7' }} />
          <span style={{ background: '#34d399' }} />
          <span style={{ background: '#16a34a' }} />
          <span style={{ background: '#15803d' }} />
        </div>
        <span className="intl-map__legend-label">More</span>
        <span className="intl-map__legend-total">
          {totalKits} {totalKits === 1 ? 'kit' : 'kits'} · {countryToCount.size}{' '}
          {countryToCount.size === 1 ? 'country' : 'countries'} · {percentDisplay}% of world
        </span>
      </div>
    </div>

    {isExpanded && (
      <div
        className="intl-map-modal-backdrop"
        onClick={() => setIsExpanded(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Expanded map"
      >
        <div
          className="intl-map-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="intl-map-modal__header">
            <h3 className="intl-map-modal__title">{title || 'Countries'}</h3>
            <button
              type="button"
              className="intl-map-modal__close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close expanded map"
            >
              <XMarkIcon className="intl-map-modal__close-icon" />
            </button>
          </div>
          <div className="intl-map-modal__body">
            <InternationalMap
              byCountry={byCountry}
              clubPins={clubPins}
              emptyMessage={emptyMessage}
              expandable={false}
            />
          </div>
        </div>
      </div>
    )}
    </>
  )
}
