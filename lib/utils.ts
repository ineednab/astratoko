export function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function formatRpShort(n: number) {
  if (n >= 1_000_000) {
    const val = n / 1_000_000
    return `Rp ${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }
  if (n >= 1_000) {
    return `Rp ${Math.round(n / 1_000).toLocaleString('id-ID')} rb`
  }
  return formatRp(n)
}
