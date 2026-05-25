import fs from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'

async function sendJson(res: ServerResponse, body: unknown, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function readSearch(url: string) {
  try {
    return new URL(url, 'http://local').searchParams
  } catch {
    return new URLSearchParams()
  }
}

export function mockCredentialsApi(root: string): Plugin {
  const mockDataPath = path.join(root, 'mock-data', 'credentials-response.json')

  return {
    name: 'mock-credentials-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!(req.method === 'GET' && typeof req.url === 'string')) {
          next()
          return
        }

        const pathnameOnly = req.url.split('?', 1)[0]
        if (pathnameOnly !== '/api/credentials') {
          next()
          return
        }

        const params = readSearch(req.url)

        if (params.has('fail')) {
          await sendJson(res, { error: 'Simulated outage' }, 503)
          return
        }

        try {
          const raw = JSON.parse(await fs.readFile(mockDataPath, 'utf8'))
          await sendJson(
            res,
            params.has('empty') ? { credentials: [] } : raw,
            200,
          )
        } catch {
          await sendJson(res, { error: 'Could not read mock-data file' }, 500)
        }
      })
    },
  }
}
