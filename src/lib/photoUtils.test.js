import { describe, it, expect } from 'vitest'
import {
  computeTargetDimensions,
  compressedFileName,
  shouldProcess,
} from './photoUtils.js'

describe('computeTargetDimensions', () => {
  it('scales the longest side down to the max, preserving ratio', () => {
    expect(computeTargetDimensions(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(computeTargetDimensions(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })

  it('never upscales', () => {
    expect(computeTargetDimensions(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })

  it('rounds to whole pixels', () => {
    const { width, height } = computeTargetDimensions(3024, 4032, 1600)
    expect(Number.isInteger(width)).toBe(true)
    expect(Number.isInteger(height)).toBe(true)
    expect(height).toBe(1600)
    expect(width).toBe(1200)
  })
})

describe('compressedFileName', () => {
  it('replaces the extension with .jpg', () => {
    expect(compressedFileName('IMG_1234.HEIC')).toBe('IMG_1234.jpg')
    expect(compressedFileName('shirt.png')).toBe('shirt.jpg')
  })

  it('handles names with dots and no extension', () => {
    expect(compressedFileName('my.kit.photo.jpeg')).toBe('my.kit.photo.jpg')
    expect(compressedFileName('photo')).toBe('photo.jpg')
  })
})

describe('shouldProcess', () => {
  const file = (type) => ({ type })

  it('processes the standard photo types (always — EXIF must be stripped)', () => {
    expect(shouldProcess(file('image/jpeg'))).toBe(true)
    expect(shouldProcess(file('image/png'))).toBe(true)
    expect(shouldProcess(file('image/webp'))).toBe(true)
    expect(shouldProcess(file('image/heic'))).toBe(true)
  })

  it('skips animated/vector types that canvas re-encoding would mangle', () => {
    expect(shouldProcess(file('image/gif'))).toBe(false)
    expect(shouldProcess(file('image/svg+xml'))).toBe(false)
  })

  it('skips non-images and missing files', () => {
    expect(shouldProcess(file('application/pdf'))).toBe(false)
    expect(shouldProcess(null)).toBe(false)
  })
})
