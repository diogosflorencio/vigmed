/**
 * Aplica CORS no bucket R2 para upload/download direto do browser.
 * Uso: node scripts/configurar-cors-r2.mjs
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'

function carregarEnvLocal() {
  try {
    const caminho = resolve(process.cwd(), '.env.local')
    const conteudo = readFileSync(caminho, 'utf8')
    for (const linha of conteudo.split('\n')) {
      const t = linha.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const chave = t.slice(0, i).trim()
      const valor = t.slice(i + 1).trim()
      if (!process.env[chave]) process.env[chave] = valor
    }
  } catch {
    console.warn('Aviso: .env.local não encontrado')
  }
}

carregarEnvLocal()

const accountId = process.env.R2_ACCOUNT_ID
const accessKey = process.env.R2_ACCESS_KEY_ID
const secretKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET_NAME ?? 'vigmed-docs'
const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'
const endpoint =
  process.env.R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`

if (!accountId || !accessKey || !secretKey) {
  console.error('Faltam R2_ACCOUNT_ID, R2_ACCESS_KEY_ID ou R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

const origens = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  `https://${dominioRaiz}`,
  `https://www.${dominioRaiz}`,
  `https://adm.${dominioRaiz}`,
  `https://docs.${dominioRaiz}`,
  `https://blog.${dominioRaiz}`,
  'https://vigmed.vercel.app',
]

if (process.env.NEXT_PUBLIC_SITE_URL) origens.push(process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ''))
if (process.env.VERCEL_URL) origens.push(`https://${process.env.VERCEL_URL}`)

const origensUnicas = [...new Set(origens)]

const cliente = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
})

try {
  await cliente.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origensUnicas,
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  )

  console.log(`CORS aplicado no bucket "${bucket}":`)
  origensUnicas.forEach((o) => console.log(`  - ${o}`))
  console.log('\nMétodos: GET, PUT, HEAD')
} catch (erro) {
  const msg = erro instanceof Error ? erro.message : String(erro)
  console.error('Falha ao configurar CORS:', msg)
  process.exit(1)
}
