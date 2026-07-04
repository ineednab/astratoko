import crypto from 'crypto'
import fs from 'fs'
import { supabase } from './supabase'

const BASE_URL     = process.env.ASTRAPAY_SANDBOX_BASE_URL    ?? 'https://sandbox.astrapay.com'
const CLIENT_ID    = process.env.ASTRAPAY_SANDBOX_CLIENT_ID   ?? ''
const CLIENT_SECRET= process.env.ASTRAPAY_SANDBOX_CLIENT_SECRET ?? ''
const MERCHANT_ID  = process.env.ASTRAPAY_SANDBOX_MERCHANT_ID ?? ''

function loadPrivateKey(): string {
  const path = process.env.ASTRAPAY_PRIVATE_KEY_PATH
  if (path) return fs.readFileSync(path, 'utf8')
  const b64 = process.env.ASTRAPAY_SANDBOX_PRIVATE_KEY_B64
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  const raw = process.env.ASTRAPAY_SANDBOX_PRIVATE_KEY ?? ''
  return raw.replace(/\\n/g, '\n')
}

function timestamp(): string {
  return new Date().toISOString()
}

function signAuth(ts: string): string {
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${CLIENT_ID}|${ts}`)
  return sign.sign(loadPrivateKey(), 'base64')
}

function signService(method: string, path: string, token: string, body: string, ts: string): string {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex').toLowerCase()
  const msg      = `${method.toUpperCase()}:${path}:${token}:${bodyHash}:${ts}`
  return crypto.createHmac('sha512', CLIENT_SECRET).update(msg).digest('base64')
}

export async function getAccessToken(): Promise<string> {
  const ts  = timestamp()
  const sig = signAuth(ts)

  const res = await fetch(`${BASE_URL}/api/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CLIENT-KEY': CLIENT_ID,
      'X-TIMESTAMP':  ts,
      'X-SIGNATURE':  sig,
    },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AstraPay token failed ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.access_token as string
}

// Look up the per-user AstraPay signature stored after account linking
async function getLinkedSignature(merchantUserId: string): Promise<string | null> {
  const { data } = await supabase
    .from('astrapay_links')
    .select('signature')
    .eq('merchant_user_id', merchantUserId)
    .single()
  return data?.signature ?? null
}

export interface CreatePaymentParams {
  merchantTransactionId: string
  amount: number
  description: string
  merchantUserId?: string
  signature?: string  // if already known (from account linking callback)
}

export interface CreatePaymentResult {
  urlRedirect?: string
  token?: string
  error?: string
  raw?: unknown
}

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const accessToken = await getAccessToken()
  const ts   = timestamp()
  const path = '/v1/merchant-service/payments'

  // Resolve the per-user signature (obtained after account linking)
  const linkedSig = params.signature
    ?? (params.merchantUserId ? await getLinkedSignature(params.merchantUserId) : null)

  if (!linkedSig) {
    return { error: 'AstraPay account not linked for this user. Please complete account linking first.' }
  }

  const body = JSON.stringify({
    signature:             linkedSig,
    merchantId:            MERCHANT_ID,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId:        params.merchantUserId ?? 'guest',
    amount:                String(params.amount),
    currency:              'IDR',
    description:           params.description,
  })

  const sig = signService('POST', path, accessToken, body, ts)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type':  'application/json',
      'X-TIMESTAMP':   ts,
      'X-SIGNATURE':   sig,
      'X-PARTNER-ID':  MERCHANT_ID,
      'X-EXTERNAL-ID': params.merchantTransactionId,
    },
    body,
  })

  const data = await res.json()
  if (!res.ok) return { error: JSON.stringify(data), raw: data }
  return data as CreatePaymentResult
}

export type TxStatus = 'APP' | 'REJ' | 'PND' | 'TIM' | null

export async function checkPaymentStatus(merchantTransactionId: string): Promise<{ status: TxStatus }> {
  try {
    const accessToken = await getAccessToken()
    const ts   = timestamp()
    const path = '/merchant-service/transaction-status'
    const body = JSON.stringify({ merchantTransactionId })
    const sig  = signService('POST', path, accessToken, body, ts)

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
        'X-TIMESTAMP':   ts,
        'X-SIGNATURE':   sig,
      },
      body,
    })

    if (!res.ok) return { status: null }
    const data = await res.json()
    return { status: (data.status ?? null) as TxStatus }
  } catch {
    return { status: null }
  }
}
