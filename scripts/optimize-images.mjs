import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return walk(fullPath)
      return [fullPath]
    })
  )

  return files.flat()
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function optimizeFile(sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase()
  if (!SUPPORTED_EXTENSIONS.has(extension)) return null

  const targetPath = sourcePath.replace(/\.(png|jpe?g)$/i, '.webp')
  const [sourceStats, targetStats] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath).catch(() => null),
  ])

  if (targetStats && targetStats.mtimeMs >= sourceStats.mtimeMs) {
    return {
      sourcePath,
      targetPath,
      sourceSize: sourceStats.size,
      targetSize: targetStats.size,
      skipped: true,
    }
  }

  try {
    await sharp(sourcePath)
      .rotate()
      .webp({
        quality: extension === '.png' ? 80 : 72,
        effort: 6,
      })
      .toFile(targetPath)
  } catch (error) {
    return {
      sourcePath,
      targetPath,
      sourceSize: sourceStats.size,
      targetSize: 0,
      skipped: true,
      invalid: true,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  const finalStats = await fs.stat(targetPath)

  return {
    sourcePath,
    targetPath,
    sourceSize: sourceStats.size,
    targetSize: finalStats.size,
    skipped: false,
  }
}

async function main() {
  const allFiles = await walk(PUBLIC_DIR)
  const candidates = allFiles.filter((file) =>
    SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase())
  )

  const results = []
  for (const file of candidates) {
    const result = await optimizeFile(file)
    if (result) results.push(result)
  }

  const processed = results.filter((result) => !result.skipped)
  const invalid = results.filter((result) => result.invalid)
  const totalSource = processed.reduce((sum, result) => sum + result.sourceSize, 0)
  const totalTarget = processed.reduce((sum, result) => sum + result.targetSize, 0)
  const savedBytes = totalSource - totalTarget

  console.log(
    `[optimize-images] ${processed.length} arquivo(s) gerados, ${results.length - processed.length - invalid.length} reaproveitado(s), ${invalid.length} inválido(s).`
  )

  if (processed.length > 0) {
    console.log(
      `[optimize-images] ${formatBytes(totalSource)} -> ${formatBytes(totalTarget)} (${formatBytes(savedBytes)} economizados).`
    )
  }

  invalid.forEach((result) => {
    console.warn(`[optimize-images] Ignorado: ${path.relative(ROOT, result.sourcePath)} (${result.error})`)
  })
}

main().catch((error) => {
  console.error('[optimize-images] Falha ao otimizar imagens.')
  console.error(error)
  process.exit(1)
})
