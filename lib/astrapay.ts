import crypto from 'crypto'
import fs from 'fs'

const BASE_URL      = process.env.ASTRAPAY_SANDBOX_BASE_URL      ?? 'https://sandbox.astrapay.com'
const CLIENT_ID     = process.env.ASTRAPAY_SANDBOX_CLIENT_ID     ?? ''
const CLIENT_SECRET = process.env.ASTRAPAY_SANDBOX_CLIENT_SECRET ?? ''

function loadPrivateKey(): string {
  const path = process.env.ASTRAPAY_PRIVATE_KEY_PATH
  if (path) return fs.readFileSync(path, 'utf8')
  const b64 = process.env.ASTRAPAY_SANDBOX_PRIVATE_KEY_B64
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  return (process.env.ASTRAPAY_SANDBOX_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
}

function snapTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth()+1)}-${pad(wib.getUTCDate())}` +
         `T${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}:${pad(wib.getUTCSeconds())}+07:00`
}

function externalId(): string {
  return Array.from({ length: 36 }, () => Math.floor(Math.random() * 10)).join('')
}

// RSA-SHA256 of `clientId|timestamp` — used for token endpoints
function signAuth(ts: string): string {
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${CLIENT_ID}|${ts}`)
  return sign.sign(loadPrivateKey(), 'base64')
}

// HMAC-SHA512 of `METHOD:PATH:token:sha256hex(body):timestamp` — used for service endpoints
function signService(method: string, path: string, token: string, body: string, ts: string): string {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex').toLowerCase()
  const msg = `${method.toUpperCase()}:${path}:${token}:${bodyHash}:${ts}`
  return crypto.createHmac('sha512', CLIENT_SECRET).update(msg).digest('base64')
}

export async function getAccessToken(): Promise<string> {
  const ts  = snapTimestamp()
  const sig = signAuth(ts)

  const res = await fetch(`${BASE_URL}/api/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'X-CLIENT-KEY':  CLIENT_ID,
      'X-TIMESTAMP':   ts,
      'X-SIGNATURE':   sig,
    },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  })

  if (!res.ok) throw new Error(`AstraPay token failed ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.access_token as string
}

export interface CreatePaymentParams {
  merchantTransactionId: string
  amount: number
  description: string
}

export interface CreatePaymentResult {
  urlRedirect?: string
  referenceNo?: string
  error?: string
  raw?: unknown
}

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  try {
    const accessToken = await getAccessToken()
    const ts   = snapTimestamp()
    const path = '/merchant-service/snap/v1.0/debit/payment-host-to-host'

    // validUpTo: 15 menit dari sekarang
    const validUpTo = new Date(Date.now() + 15 * 60 * 1000)
    const wib = new Date(validUpTo.getTime() + 7 * 60 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const validUpToStr = `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth()+1)}-${pad(wib.getUTCDate())}` +
      `T${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}:${pad(wib.getUTCSeconds())}+07:00`

    const body = JSON.stringify({
      partnerReferenceNo: params.merchantTransactionId,
      validUpTo: validUpToStr,
      amount: {
        value:    `${params.amount}.00`,
        currency: 'IDR',
      },
      additionalInfo: {
        description: params.description,
      },
    })

    const sig = signService('POST', path, accessToken, body, ts)

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
        'X-TIMESTAMP':   ts,
        'X-SIGNATURE':   sig,
        'X-PARTNER-ID':  CLIENT_ID,
        'X-EXTERNAL-ID': externalId(),
        'CHANNEL-ID':    '00854',
      },
      body,
    })

    const data = await res.json()
    if (!res.ok) return { error: JSON.stringify(data), raw: data }
    return { urlRedirect: data.webRedirectUrl, referenceNo: data.referenceNo }
  } catch (err) {
    return { error: String(err) }
  }
}

// SNAP status codes: 00=Success, 01=Initiated, 02=Paying, 03=Pending, 05=Canceled, 06=Failed
export type TxStatus = '00' | '01' | '02' | '03' | '05' | '06' | null

export async function checkPaymentStatus(params: {
  merchantTransactionId: string
  amount: number
}): Promise<{ status: TxStatus }> {
  try {
    const accessToken = await getAccessToken()
    const ts   = snapTimestamp()
    const path = '/merchant-service/snap/v1.0/debit/status'

    const body = JSON.stringify({
      originalPartnerReferenceNo: params.merchantTransactionId,
      serviceCode: '54',
      amount: {
        value:    `${params.amount}.00`,
        currency: 'IDR',
      },
    })

    const sig = signService('POST', path, accessToken, body, ts)

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
        'X-TIMESTAMP':   ts,
        'X-SIGNATURE':   sig,
        'X-PARTNER-ID':  CLIENT_ID,
        'X-EXTERNAL-ID': externalId(),
        'CHANNEL-ID':    '00155',
      },
      body,
    })

    if (!res.ok) return { status: null }
    const data = await res.json()
    return { status: (data.latestTransactionStatus ?? null) as TxStatus }
  } catch {
    return { status: null }
  }
}
