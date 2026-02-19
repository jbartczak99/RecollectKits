import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  TableCellsIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import BulkUploadReview from '../components/jerseys/BulkUploadReview'

const TEMPLATE_COLUMNS = [
  'team_name',
  'season',
  'kit_type',
  'jersey_type',
  'league',
  'competition_gender',
  'jersey_fit',
  'manufacturer',
  'player_name',
  'player_number',
  'primary_color',
  'secondary_color',
  'main_sponsor',
  'additional_sponsors',
  'description'
]

const REQUIRED_COLUMNS = ['team_name', 'season', 'kit_type', 'jersey_type']

const KIT_TYPE_OPTIONS = ['club', 'international']
const JERSEY_TYPE_OPTIONS = ['home', 'away', 'third', 'goalkeeper', 'special']
const COMPETITION_GENDER_OPTIONS = ['mens', 'womens']
const JERSEY_FIT_OPTIONS = ['mens', 'womens', 'youth']

// Season options: club ranges (2015-16 .. 2029-30) then international single years (2015 .. 2030)
const SEASON_OPTIONS = (() => {
  const club = []
  const intl = []
  for (let y = 2015; y <= 2030; y++) {
    intl.push(String(y))
    if (y < 2030) club.push(`${y}-${String(y + 1).slice(-2)}`)
  }
  return [...club, ...intl]
})()

const SAMPLE_ROWS = [
  {
    team_name: 'Manchester United',
    season: '2024-25',
    kit_type: 'club',
    jersey_type: 'home',
    league: 'Premier League',
    competition_gender: 'mens',
    jersey_fit: 'mens',
    manufacturer: 'Adidas',
    player_name: 'Fernandes',
    player_number: '8',
    primary_color: 'Red',
    secondary_color: 'White',
    main_sponsor: 'Snapdragon',
    additional_sponsors: 'DHL, Kohler',
    description: 'Home kit with classic red design'
  },
  {
    team_name: 'United States',
    season: '2024',
    kit_type: 'international',
    jersey_type: 'home',
    league: 'International',
    competition_gender: 'womens',
    jersey_fit: 'womens',
    manufacturer: 'Nike',
    player_name: 'Trinity Rodman',
    player_number: '11',
    primary_color: 'White',
    secondary_color: 'Blue',
    main_sponsor: '',
    additional_sponsors: '',
    description: "USWNT home kit"
  }
]

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet('Kits')

  // Set column widths
  TEMPLATE_COLUMNS.forEach((col, i) => {
    ws.getColumn(i + 1).width = col === 'description' ? 40 : col === 'additional_sponsors' ? 25 : 18
  })

  // Add header row with styling
  const headerRow = ws.addRow(TEMPLATE_COLUMNS)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } }
  headerRow.eachCell(cell => {
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF5B21B6' } } }
  })

  // Add sample rows
  SAMPLE_ROWS.forEach(row => {
    ws.addRow(TEMPLATE_COLUMNS.map(col => row[col] || ''))
  })

  // Data validation dropdown lists
  const seasonList = `"${SEASON_OPTIONS.join(',')}"`
  const kitTypeList = `"${KIT_TYPE_OPTIONS.join(',')}"`
  const jerseyTypeList = `"${JERSEY_TYPE_OPTIONS.join(',')}"`
  const competitionGenderList = `"${COMPETITION_GENDER_OPTIONS.join(',')}"`
  const jerseyFitList = `"${JERSEY_FIT_OPTIONS.join(',')}"`

  for (let i = 2; i <= 200; i++) {
    ws.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [seasonList]
    }
    ws.getCell(`C${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [kitTypeList]
    }
    ws.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [jerseyTypeList]
    }
    ws.getCell(`F${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [competitionGenderList]
    }
    ws.getCell(`G${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [jerseyFitList]
    }
  }

  // Generate and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'RecollectKits_Bulk_Template.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const firstSheet = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

        if (jsonData.length === 0) {
          reject(new Error('The spreadsheet is empty. Please add at least one row of data.'))
          return
        }

        // Validate headers
        const fileHeaders = Object.keys(jsonData[0]).map(h => h.trim().toLowerCase())
        const missingRequired = REQUIRED_COLUMNS.filter(
          col => !fileHeaders.includes(col.toLowerCase())
        )

        if (missingRequired.length > 0) {
          reject(new Error(
            `Missing required columns: ${missingRequired.join(', ')}. ` +
            'Please use the provided template.'
          ))
          return
        }

        // Normalize keys to lowercase
        const normalizedData = jsonData.map(row => {
          const normalized = {}
          Object.entries(row).forEach(([key, value]) => {
            normalized[key.trim().toLowerCase()] = typeof value === 'string' ? value.trim() : value
          })
          return normalized
        })

        // Validate required field values per row
        const rowErrors = []
        normalizedData.forEach((row, i) => {
          const rowNum = i + 2 // +2 for 1-indexed and header row
          const missing = REQUIRED_COLUMNS.filter(
            col => !row[col] || String(row[col]).trim() === ''
          )
          if (missing.length > 0) {
            rowErrors.push(`Row ${rowNum}: missing ${missing.join(', ')}`)
          }
          if (row.kit_type && !KIT_TYPE_OPTIONS.includes(String(row.kit_type).toLowerCase())) {
            rowErrors.push(`Row ${rowNum}: kit_type "${row.kit_type}" must be one of: ${KIT_TYPE_OPTIONS.join(', ')}`)
          }
          if (row.jersey_type && !JERSEY_TYPE_OPTIONS.includes(String(row.jersey_type).toLowerCase())) {
            rowErrors.push(`Row ${rowNum}: jersey_type "${row.jersey_type}" must be one of: ${JERSEY_TYPE_OPTIONS.join(', ')}`)
          }
          if (row.competition_gender && !COMPETITION_GENDER_OPTIONS.includes(String(row.competition_gender).toLowerCase())) {
            rowErrors.push(`Row ${rowNum}: competition_gender "${row.competition_gender}" must be one of: ${COMPETITION_GENDER_OPTIONS.join(', ')}`)
          }
          // jersey_fit: soft-validate only — invalid values default to 'mens' in review
          if (row.jersey_fit && !JERSEY_FIT_OPTIONS.includes(String(row.jersey_fit).toLowerCase())) {
            row.jersey_fit = 'mens'
          }
        })

        if (rowErrors.length > 0) {
          const shown = rowErrors.slice(0, 5)
          const more = rowErrors.length > 5 ? `\n...and ${rowErrors.length - 5} more error${rowErrors.length - 5 !== 1 ? 's' : ''}` : ''
          reject(new Error(shown.join('\n') + more))
          return
        }

        resolve(normalizedData)
      } catch (err) {
        reject(new Error('Could not parse file. Please ensure it is a valid .xlsx or .csv file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsArrayBuffer(file)
  })
}

export default function BulkUpload() {
  const navigate = useNavigate()
  const [parsedData, setParsedData] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setFileName(file.name)
    setParseError(null)
    setParsedData(null)
    setIsParsing(true)

    try {
      const data = await parseFile(file)
      setParsedData(data)
    } catch (err) {
      setParseError(err.message)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const clearFile = () => {
    setParsedData(null)
    setFileName(null)
    setParseError(null)
  }

  const handleBackFromReview = () => {
    setShowReview(false)
  }

  // Show review step
  if (showReview && parsedData) {
    return (
      <BulkUploadReview
        initialData={parsedData}
        onBack={handleBackFromReview}
      />
    )
  }

  const steps = [
    { icon: ArrowDownTrayIcon, text: 'Download Template', desc: 'Get our pre-formatted spreadsheet' },
    { icon: PencilSquareIcon, text: 'Fill In Details', desc: 'One row per kit, all the info' },
    { icon: ArrowUpTrayIcon, text: 'Upload File', desc: 'Drag & drop your completed sheet' },
    { icon: MagnifyingGlassCircleIcon, text: 'Review & Images', desc: 'Verify entries and add photos' },
    { icon: PaperAirplaneIcon, text: 'Submit', desc: 'Send for admin review' }
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Header */}
      <div
        className="rounded-xl overflow-hidden shadow-lg mb-8"
        style={{
          background: 'linear-gradient(-45deg, #7C3AED, #5B21B6, #4C1D95, #3730A3, #312E81)'
        }}
      >
        <div style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)'
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', left: '40px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)'
          }} />

          <button
            onClick={() => navigate('/jerseys')}
            className="inline-flex items-center gap-2 mb-5 transition-all duration-200"
            style={{
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            }}
          >
            <ArrowLeftIcon style={{ width: '14px', height: '14px' }} />
            Back to Kits
          </button>

          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-2xl"
              style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)' }}
            >
              <TableCellsIcon style={{ width: '30px', height: '30px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Bulk Upload
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                Add multiple kits to the database at once
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works — horizontal step cards */}
      <div className="mb-8">
        <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '12px' }}>
          How It Works
        </h2>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon
            const iconColor = i === 4 ? '#205A40' : '#7C3AED'
            const iconBg = i === 4 ? 'rgba(32,90,64,0.1)' : 'rgba(124,58,237,0.08)'
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl"
                style={{
                  padding: '14px 18px',
                  background: '#fff',
                  border: '1px solid #E5E7EB'
                }}
              >
                {/* Step number */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#9CA3AF', flexShrink: 0
                }}>
                  {i + 1}
                </div>

                {/* Icon */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: '36px', height: '36px', background: iconBg }}
                >
                  <Icon style={{ width: '18px', height: '18px', color: iconColor }} />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', lineHeight: 1.3 }}>{step.text}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.3 }}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 1: Download Template Card */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: '1px solid #E5E7EB', background: '#fff' }}
      >
        <div className="flex items-center gap-3" style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: '32px', height: '32px', background: 'rgba(124,58,237,0.1)' }}
          >
            <ArrowDownTrayIcon style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937' }}>Step 1: Download Template</h2>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.6 }}>
            Our template includes all the required columns, two example rows, and dropdown menus for kit type fields.
          </p>

          <button
            onClick={generateTemplate}
            className="inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all duration-200"
            style={{
              backgroundColor: '#7C3AED', fontSize: '15px',
              padding: '12px 24px',
              boxShadow: '0 4px 14px -3px rgba(124,58,237,0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6D28D9'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px -3px rgba(124,58,237,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#7C3AED'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px -3px rgba(124,58,237,0.4)'
            }}
          >
            <ArrowDownTrayIcon style={{ width: '20px', height: '20px' }} />
            Download Template (.xlsx)
          </button>

          {/* Column pills */}
          <div className="mt-5 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Template Columns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_COLUMNS.map(col => (
                <span
                  key={col}
                  className="inline-block rounded-full font-medium"
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    backgroundColor: REQUIRED_COLUMNS.includes(col) ? '#D4E8DC' : '#F3F4F6',
                    color: REQUIRED_COLUMNS.includes(col) ? '#205A40' : '#6B7280',
                    border: REQUIRED_COLUMNS.includes(col) ? '1px solid #C2DDD0' : '1px solid #E5E7EB'
                  }}
                >
                  {col.replace(/_/g, ' ')}{REQUIRED_COLUMNS.includes(col) ? ' *' : ''}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>* Required fields</p>
          </div>
        </div>
      </div>

      {/* Step 2: Upload Card */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: '1px solid #E5E7EB', background: '#fff' }}
      >
        <div className="flex items-center gap-3" style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: '32px', height: '32px', background: 'rgba(32,90,64,0.1)' }}
          >
            <CloudArrowUpIcon style={{ width: '18px', height: '18px', color: '#205A40' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937' }}>Step 2: Upload Spreadsheet</h2>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {!parsedData && !parseError ? (
            <div
              {...getRootProps()}
              className="rounded-xl text-center cursor-pointer transition-all duration-200"
              style={{
                border: `2px dashed ${isDragActive ? '#205A40' : '#D1D5DB'}`,
                backgroundColor: isDragActive ? '#EDF5F0' : '#FAFAFA',
                padding: '48px 24px'
              }}
            >
              <input {...getInputProps()} />
              <div
                className="mx-auto mb-4 flex items-center justify-center rounded-full"
                style={{
                  width: '64px', height: '64px',
                  background: isDragActive ? 'rgba(32,90,64,0.1)' : 'rgba(0,0,0,0.04)'
                }}
              >
                <CloudArrowUpIcon style={{
                  width: '32px', height: '32px',
                  color: isDragActive ? '#205A40' : '#9CA3AF'
                }} />
              </div>
              {isParsing ? (
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#4B5563' }}>Processing file...</p>
              ) : isDragActive ? (
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#205A40' }}>Drop your file here</p>
              ) : (
                <>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Drag & drop your completed spreadsheet
                  </p>
                  <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                    or <span style={{ color: '#7C3AED', fontWeight: 500 }}>click to browse</span> — accepts .xlsx and .csv
                  </p>
                </>
              )}
            </div>
          ) : parseError ? (
            <div
              className="rounded-xl"
              style={{ border: '1px solid #FECACA', backgroundColor: '#FEF2F2', padding: '20px' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '36px', height: '36px', background: '#FEE2E2' }}
                  >
                    <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#EF4444' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>{fileName}</p>
                    <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>{parseError}</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XMarkIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl"
              style={{ border: '1px solid #C2DDD0', backgroundColor: '#EDF5F0', padding: '20px' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '36px', height: '36px', background: '#D4E8DC' }}
                  >
                    <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#205A40' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>{fileName}</p>
                    <p style={{ color: '#205A40', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>
                      {parsedData.length} kit{parsedData.length !== 1 ? 's' : ''} found and ready to review
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XMarkIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div
        className="rounded-xl"
        style={{ padding: '20px 24px', background: '#fff', border: '1px solid #E5E7EB' }}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/jerseys')}
            className="px-5 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '14px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >
            Cancel
          </button>
          <button
            onClick={() => setShowReview(true)}
            disabled={!parsedData}
            className="inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all duration-200"
            style={{
              padding: '12px 28px',
              fontSize: '15px',
              background: parsedData ? 'linear-gradient(135deg, #205A40, #7C3AED)' : '#D1D5DB',
              boxShadow: parsedData ? '0 4px 14px -3px rgba(124,58,237,0.4)' : 'none',
              cursor: parsedData ? 'pointer' : 'not-allowed',
              opacity: parsedData ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (parsedData) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px -3px rgba(124,58,237,0.5)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = parsedData ? '0 4px 14px -3px rgba(124,58,237,0.4)' : 'none'
            }}
          >
            Continue to Review
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '2px' }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
