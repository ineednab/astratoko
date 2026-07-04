const BASE_URL      = process.env.ASTRAPAY_SANDBOX_BASE_URL     ?? 'https://sandbox.astrapay.com'
const CLIENT_ID     = process.env.ASTRAPAY_SANDBOX_CLIENT_ID    ?? ''
const CLIENT_SECRET = process.env.ASTRAPAY_SANDBOX_CLIENT_SECRET ?? ''

export async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

export interface CreatePaymentParams {
  merchantTransactionId: string
  amount: number
  description: string
}

export interface CreatePaymentResult {
  urlRedirect?: string
  token?: string
  error?: string
  raw?: unknown
}

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const accessToken = await getAccessToken()

  const body = JSON.stringify({
    merchantTransactionId: params.merchantTransactionId,
    amount:                String(params.amount),
    currency:              'IDR',
    description:           params.description,
  })

  const res = await fetch(`${BASE_URL}/merchant-service/push-payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type':  'application/json',
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
