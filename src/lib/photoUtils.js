// Photo compression + EXIF strip (blitz plan June 13 batch item e).
//
// Privacy first: phone photos carry EXIF (GPS coordinates, device serials).
// Re-encoding through a canvas keeps only pixels — EXIF never survives — so
// every standard photo type is processed even when it's already small.
// Compression (long side capped, JPEG ~0.82) is the bandwidth bonus.

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

// Types where canvas re-encoding is lossy in kind, not just quality.
const SKIP_TYPES = new Set(['image/gif', 'image/svg+xml'])

export function computeTargetDimensions(width, height, maxDimension = MAX_DIMENSION) {
  const longest = Math.max(width, height)
  if (longest <= maxDimension) return { width, height }
  const scale = maxDimension / longest
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

export function compressedFileName(name) {
  const base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name
  return `${base}.jpg`
}

export function shouldProcess(file) {
  if (!file || !file.type) return false
  if (!file.type.startsWith('image/')) return false
  return !SKIP_TYPES.has(file.type)
}

// Browser-only. Returns a new JPEG File with EXIF stripped and dimensions
// capped, or the original file untouched if processing isn't possible
// (unsupported type, decode failure) — uploads must never break over this.
export async function compressImage(file, { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = {}) {
  if (!shouldProcess(file)) return file

  try {
    // imageOrientation honors the EXIF rotation before we discard the EXIF.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const { width, height } = computeTargetDimensions(bitmap.width, bitmap.height, maxDimension)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file

    return new File([blob], compressedFileName(file.name), { type: 'image/jpeg' })
  } catch {
    return file
  }
}
