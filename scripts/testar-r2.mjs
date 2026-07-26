/**
 * Testa conexão com o bucket R2 - uso: node scripts/testar-r2.mjs
 * Carrega variáveis de .env.local sem dependências extras.
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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
const endpoint =
  process.env.R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`

if (!accountId || !accessKey || !secretKey) {
  console.error('Faltam R2_ACCOUNT_ID, R2_ACCESS_KEY_ID ou R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

const cliente = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
})

const chaveTeste = `_testes/conexao-${Date.now()}.txt`

try {
  await cliente.send(new HeadBucketCommand({ Bucket: bucket }))
  console.log(`OK - bucket "${bucket}" acessível`)

  await cliente.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: chaveTeste,
      Body: 'vigmed-r2-ok',
      ContentType: 'text/plain',
    }),
  )
  console.log(`OK - upload de teste: ${chaveTeste}`)

  await cliente.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: chaveTeste }),
  )
  console.log('OK - arquivo de teste removido')
  console.log('\nR2 conectado com sucesso.')
} catch (erro) {
  const msg = erro instanceof Error ? erro.message : String(erro)
  console.error('Falha:', msg)
  if (msg.includes('NotFound') || msg.includes('NoSuchBucket')) {
    console.error(`\nCrie o bucket "${bucket}" no painel Cloudflare → R2 → Create bucket`)
  }
  process.exit(1)
}
