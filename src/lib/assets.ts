const LOCAL_RASTER_EXTENSION = /\.(png|jpe?g)(?=([?#].*)?$)/i

export function getOptimizedAssetSrc(src?: string | null) {
  if (!src) return src ?? null
  if (/^(data:|https?:)/i.test(src)) return src
  if (!LOCAL_RASTER_EXTENSION.test(src)) return src
  return src.replace(LOCAL_RASTER_EXTENSION, '.webp')
}
