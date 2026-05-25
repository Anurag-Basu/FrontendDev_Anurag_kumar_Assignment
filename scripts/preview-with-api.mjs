/**
 * Minimal static server for `dist/` plus GET /api/credentials.
 * `vite preview` does not ship API routes — this mirrors the mock used in dev.
 */
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const MOCK_CREDENTIALS_JSON = path.join(ROOT, 'mock-data', 'credentials-response.json')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function pickMime(ext) {
  return MIME[ext] ?? 'application/octet-stream'
}

function safeResolvedPath(rel) {
  const candidate = path.join(DIST, rel)
  const normalized = path.normalize(candidate)
  if (!normalized.startsWith(DIST)) return null
  return normalized
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `http://${host}`)

  if (url.pathname === '/api/credentials' && req.method === 'GET') {
    try {
      if (url.searchParams.has('fail')) {
        res.writeHead(503, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        })
        res.end(JSON.stringify({ error: 'Simulated outage' }))
        return
      }

      const payload = JSON.parse(await fs.readFile(MOCK_CREDENTIALS_JSON, 'utf8'))
      const body =
        url.searchParams.has('empty') || url.searchParams.has('clear')
          ? JSON.stringify({ credentials: [] })
          : JSON.stringify(payload)

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'max-age=0',
      })
      res.end(body)
    } catch (err) {
      res.writeHead(500, {
        'Content-Type': 'application/json; charset=utf-8',
      })
      res.end(JSON.stringify({ error: 'mock-data/credentials-response.json unreadable' }))
    }
    return
  }

  try {
    const rel =
      decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '') || 'index.html'
    let filePath =
      safeResolvedPath(rel) ?? safeResolvedPath(path.join(rel || '', 'index.html'))

    try {
      const stat = await fs.stat(filePath)
      if (!stat.isFile()) {
        filePath = safeResolvedPath('index.html')
      }
    } catch {
      filePath = safeResolvedPath('index.html')
    }

    if (!filePath) {
      res.writeHead(400)
      res.end()
      return
    }

    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath)

    const headers =
      ext === '.html'
        ? { 'Content-Type': pickMime(ext), 'Cache-Control': 'no-store' }
        : {
            'Content-Type': pickMime(ext),
            'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
          }

    res.writeHead(200, headers)
    res.end(data)
  } catch {
    res.writeHead(500)
    res.end('Server error')
  }
})

const port = Number(process.env.PORT ?? 4173)
server.listen(port, () => {
  console.log(`Preview at http://localhost:${port} (static + /api/credentials)`)
})
