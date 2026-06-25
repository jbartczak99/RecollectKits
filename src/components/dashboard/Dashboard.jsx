import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollectionStats } from '../../hooks/useCollectionStats'
import { normalizeCountryName } from '../../utils/countryGeo'
import { cityToCoords } from '../../utils/cityCoords'
import StatCard from './StatCard'
import ChartCard from './ChartCard'
import DistributionDonut from './DistributionDonut'
import DistributionBar from './DistributionBar'
import GrowthTimeline from './GrowthTimeline'
import InternationalMap from './InternationalMap'
import './Dashboard.css'

const formatMonthYear = (date) =>
  date ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null

const buildClubMapSubtitle = (stats) => {
  const linked = stats.clubKitsLinkedCount || 0
  const fallback = stats.clubKitsFallbackCount || 0
  const unmapped = stats.unmappedClubCount || 0
  const parts = []
  if (linked > 0) parts.push(`${linked} via club record`)
  if (fallback > 0) parts.push(`${fallback} via league fallback`)
  if (unmapped > 0) parts.push(`${unmapped} unmapped`)
  const detail = parts.length > 0 ? ` (${parts.join(', ')})` : ''
  return `Shaded where your club kits originate — darker means more${detail}`
}

export default function Dashboard({ onAddKit }) {
  const { stats, loading, error } = useCollectionStats()
  const [mapView, setMapView] = useState('international')

  // If the user has no international kits but does have club kits, default
  // the map to the club view (and vice versa). Re-runs when stats change.
  useEffect(() => {
    if (!stats) return
    if (stats.internationalCount === 0 && stats.clubCount > 0) {
      setMapView('club')
    } else if (stats.clubCount === 0 && stats.internationalCount > 0) {
      setMapView('international')
    }
  }, [stats])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__skeleton-row">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton--stat" />
          ))}
        </div>
        <div className="dashboard__skeleton-charts">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton--chart" />
          ))}
        </div>
        <div className="skeleton skeleton--timeline" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard__error">
        Error loading your dashboard: {error}
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="dashboard__empty">
        <h2 className="dashboard__empty-title">Your dashboard is waiting</h2>
        <p className="dashboard__empty-text">
          Add your first kit and we'll start tracking distributions, eras, and your collection growth over time.
        </p>
        {onAddKit ? (
          <button type="button" onClick={onAddKit} className="dashboard__empty-cta">
            Find your first kit
          </button>
        ) : (
          <Link to="/jerseys" className="dashboard__empty-cta">Browse kits to add</Link>
        )}
      </div>
    )
  }

  const deltaHint = stats.addedThisMonth > 0
    ? `+${stats.addedThisMonth} this month`
    : 'No new kits this month'

  const collectingSinceHint = stats.collectingSince
    ? formatMonthYear(stats.collectingSince)
    : 'Just started'

  const clubIntlData = [
    { name: 'Club', value: stats.clubCount },
    { name: 'International', value: stats.internationalCount },
  ].filter((d) => d.value > 0)

  // Per-club pin list for the club map view: one entry per (country, team)
  // the user owns. Use the club's own coordinates when present (precise,
  // global); fall back to the static city lookup. Clubs with neither are
  // silently skipped (no pin).
  const clubPins = (stats.clubsList || [])
    .map((c) => {
      let lat = c.lat
      let lng = c.lng
      if (lat == null || lng == null) {
        const coords = cityToCoords(c.city, c.country)
        if (!coords) return null
        ;[lat, lng] = coords
      }
      return {
        team: c.team,
        city: c.city,
        country: c.country,
        geoCountry: normalizeCountryName(c.country),
        count: c.count,
        lat,
        lng,
      }
    })
    .filter(Boolean)

  return (
    <div className="dashboard">
      <div className="dashboard__stat-row">
        <StatCard
          accent="green"
          label="Total Kits"
          value={stats.total.toLocaleString()}
          hint={deltaHint}
        />
        <StatCard
          accent="blue"
          label="Teams Represented"
          value={stats.teamsCount.toLocaleString()}
          hint={stats.teamsCount === 1 ? '1 unique team' : `${stats.teamsCount} unique teams`}
        />

        {/* Club / International split */}
        <div className="stat-card stat-card--purple">
          <div className="stat-card__bar" />
          <div className="stat-card__body">
            <p className="stat-card__label">Club / International</p>
            <div className="stat-card__split">
              <div className="stat-card__split-side">
                <span className="stat-card__split-value">{stats.clubCount.toLocaleString()}</span>
                <span className="stat-card__split-label">Club</span>
              </div>
              <span className="stat-card__split-divider">·</span>
              <div className="stat-card__split-side">
                <span className="stat-card__split-value">{stats.internationalCount.toLocaleString()}</span>
                <span className="stat-card__split-label">Intl</span>
              </div>
            </div>
            <p className="stat-card__hint">
              {stats.countriesCount > 0
                ? `${stats.countriesCount} ${stats.countriesCount === 1 ? 'country' : 'countries'}`
                : 'No international kits yet'}
            </p>
          </div>
        </div>

        {/* Men's / Women's league split */}
        <div className="stat-card stat-card--rose">
          <div className="stat-card__bar" />
          <div className="stat-card__body">
            <p className="stat-card__label">Men's / Women's leagues</p>
            <div className="stat-card__split">
              <div className="stat-card__split-side">
                <span className="stat-card__split-value">{stats.mensLeagueCount.toLocaleString()}</span>
                <span className="stat-card__split-label">Men's</span>
              </div>
              <span className="stat-card__split-divider">·</span>
              <div className="stat-card__split-side">
                <span className="stat-card__split-value">{stats.womensLeagueCount.toLocaleString()}</span>
                <span className="stat-card__split-label">Women's</span>
              </div>
            </div>
            <p className="stat-card__hint">
              {stats.unknownGenderLeagueCount > 0
                ? `${stats.unknownGenderLeagueCount} unclassified (international or other)`
                : 'Based on league'}
            </p>
          </div>
        </div>

        <StatCard
          accent="orange"
          label="Collection Age"
          value={collectingSinceHint}
          hint={stats.collectingSince ? 'Since you started' : 'Add your first kit'}
        />
      </div>

      <div className="dashboard__charts">
        <ChartCard title="By Team" subtitle="Top 5 teams; rest grouped as Other">
          <DistributionDonut data={stats.byTeam} totalForEmptyCheck={stats.teamTotal} />
        </ChartCard>
        <ChartCard title="By Brand" subtitle="Top 5 manufacturers; rest grouped as Other">
          <DistributionDonut data={stats.byManufacturer} totalForEmptyCheck={stats.manufacturerTotal} />
        </ChartCard>
        <ChartCard title="By League / Competition">
          <DistributionBar
            data={stats.byLeague}
            totalForEmptyCheck={stats.leagueTotal}
            gradientId="leagueGradient"
            gradientFrom="#16A34A"
            gradientTo="#2563EB"
          />
        </ChartCard>
        <ChartCard title="By Era / Decade">
          <DistributionBar
            data={stats.byDecade}
            totalForEmptyCheck={stats.decadeTotal}
            gradientId="decadeGradient"
            gradientFrom="#7C3AED"
            gradientTo="#DB2777"
          />
        </ChartCard>
      </div>

      <div className="dashboard__split-row">
        <ChartCard
          title="Club vs International"
          subtitle="Click a slice to switch the map"
        >
          <DistributionDonut
            data={clubIntlData}
            totalForEmptyCheck={stats.total}
            onSliceClick={(entry) => {
              if (entry.name === 'Club') setMapView('club')
              else if (entry.name === 'International') setMapView('international')
            }}
            activeName={mapView === 'club' ? 'Club' : 'International'}
          />
        </ChartCard>
        <ChartCard
          title={mapView === 'club' ? 'Countries (club kits)' : 'Countries (international kits)'}
          subtitle={
            mapView === 'club'
              ? buildClubMapSubtitle(stats)
              : 'Shaded where you have international kits — darker means more'
          }
        >
          <InternationalMap
            byCountry={mapView === 'club' ? stats.byClubCountry : stats.byCountry}
            clubPins={mapView === 'club' ? clubPins : null}
            title={mapView === 'club' ? 'Countries (club kits)' : 'Countries (international kits)'}
            emptyMessage={
              mapView === 'club'
                ? 'Add club kits from supported leagues to map their country of origin.'
                : "Add international kits to map where you've collected from."
            }
          />
        </ChartCard>
      </div>

      <ChartCard title="Collection Growth" subtitle="Cumulative kits added, by month">
        <GrowthTimeline data={stats.growth} />
      </ChartCard>
    </div>
  )
}
