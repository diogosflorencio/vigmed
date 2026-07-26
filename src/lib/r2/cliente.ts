import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const nomeBucket = () => process.env.R2_BUCKET_NAME ?? 'vigmed-docs'

function endpointR2() {
  if (process.env.R2_ENDPOINT) return process.env.R2_ENDPOINT
  const idConta = process.env.R2_ACCOUNT_ID
  if (!idConta) throw new Error('R2_ACCOUNT_ID não configurado')
  return `https://${idConta}.r2.cloudflarestorage.com`
}

/** Cliente S3 compatível com Cloudflare R2 */
function criarClienteR2() {
  const chaveAcesso = process.env.R2_ACCESS_KEY_ID
  const chaveSecreta = process.env.R2_SECRET_ACCESS_KEY

  if (!chaveAcesso || !chaveSecreta) {
    throw new Error('Credenciais do Cloudflare R2 não configuradas')
  }

  return new S3Client({
    region: 'auto',
    endpoint: endpointR2(),
    credentials: {
      accessKeyId: chaveAcesso,
      secretAccessKey: chaveSecreta,
    },
  })
}

/**
 * Gera URL assinada para upload direto ao R2 (PUT).
 * O cliente envia o arquivo sem passar pelo servidor Next.js.
 */
export async function gerarUrlUploadAssinada(
  chaveArquivo: string,
  tipoMime: string,
  tamanhoMaximo?: number,
) {
  const cliente = criarClienteR2()
  const comando = new PutObjectCommand({
    Bucket: nomeBucket(),
    Key: chaveArquivo,
    ContentType: tipoMime,
    ...(tamanhoMaximo ? { ContentLength: tamanhoMaximo } : {}),
  })

  const url = await getSignedUrl(cliente, comando, { expiresIn: 600 })
  return url
}

/**
 * Gera URL assinada para download seguro (GET).
 * Expira em 15 minutos - nunca expor links permanentes.
 */
export async function gerarUrlDownloadAssinada(chaveArquivo: string, nomeArquivo?: string) {
  const cliente = criarClienteR2()
  const comando = new GetObjectCommand({
    Bucket: nomeBucket(),
    Key: chaveArquivo,
    ...(nomeArquivo
      ? { ResponseContentDisposition: `attachment; filename="${nomeArquivo}"` }
      : {}),
  })

  const url = await getSignedUrl(cliente, comando, { expiresIn: 900 })
  return url
}

/** Remove arquivo do R2 - chamado ao excluir documento */
export async function excluirArquivoR2(chaveArquivo: string) {
  const cliente = criarClienteR2()
  await cliente.send(
    new DeleteObjectCommand({
      Bucket: nomeBucket(),
      Key: chaveArquivo,
    }),
  )
}

/**
 * Monta a chave única do arquivo no bucket.
 * Formato: empresas/{empresaId}/documentos/{documentoId}/{nomeSanitizado}
 */
export function montarChaveArquivo(
  empresaId: string,
  documentoId: string,
  nomeArquivo: string,
): string {
  const nomeSanitizado = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `empresas/${empresaId}/documentos/${documentoId}/${nomeSanitizado}`
}

/** Chave de imagem do blog no R2 */
export function montarChaveBlogImagem(postId: string, nomeArquivo: string): string {
  const nomeSanitizado = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `blog/${postId}/${nomeSanitizado}`
}

/** URL pública do R2 quando R2_PUBLIC_URL está configurado */
export function urlPublicaR2(chaveArquivo: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
  if (!base) return null
  return `${base}/${chaveArquivo}`
}

/** URL para exibir imagem do blog (pública ou via API de presign) */
export function urlImagemBlog(chaveArquivo: string): string {
  return urlPublicaR2(chaveArquivo) ?? `/api/blog/imagem?chave=${encodeURIComponent(chaveArquivo)}`
}
