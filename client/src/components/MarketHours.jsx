import { useEffect, useState } from 'react'

// Bursa AS: 09:30 - 16:00 Eastern Time.
// EDT (Mar-Nov) = UTC-4 -> 20:30 - 03:00 WIB
// EST (Nov-Mar) = UTC-5 -> 21:30 - 04:00 WIB
function getMarketSession(now = new Date()) {
  // Offset Eastern Time tergantung DST Amerika (kedua tahun 2026 & umum:
  // DST mulai Minggu ke-2 Maret, berakhir Minggu ke-1 November)
  const year = now.getUTCFullYear()
  const dstStart = new Date(Date.UTC(year, 2, 1)) // 1 Mar
  dstStart.setUTCDate(dstStart.getUTCDate() + ((7 - dstStart.getUTCDay()) % 7) + 7) // Minggu ke-2 Maret
  const dstEnd = new Date(Date.UTC(year, 10, 1)) // 1 Nov
  dstEnd.setUTCDate(dstEnd.getUTCDate() + ((7 - dstEnd.getUTCDay()) % 7)) // Minggu ke-1 November
  const isDST = now >= dstStart && now < dstEnd

  const etOffsetHours = isDST ? -4 : -5 // EDT / EST terhadap UTC
  const openUtcMin = (9 * 60 + 30) - etOffsetHours * 60
  const closeUtcMin = 16 * 60 - etOffsetHours * 60

  const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes()
  const day = now.getUTCDay()
  const isWeekday = day >= 1 && day <= 5

  // Sesi bisa lewat tengah malam UTC (close = 20:00/21:00 UTC, aman),
  // jadi cukup bandingkan langsung
  const isOpen = isWeekday && nowUtcMin >= openUtcMin && nowUtcMin < closeUtcMin

  // Waktu buka/tutup dalam WIB (UTC+7)
  const openWib = `${String(Math.floor(openUtcMin / 60) + 7).padStart(2, '0')}:${String(openUtcMin % 60).padStart(2, '0')}`
  const closeRaw = closeUtcMin + 7 * 60
  const closeWib = `${String(Math.floor(closeRaw / 60) % 24).padStart(2, '0')}:${String(closeRaw % 60).padStart(2, '0')}`

  return {
    isOpen,
    isDST,
    openWib,
    closeWib,
    label: isDST ? 'EDT (UTC-4)' : 'EST (UTC-5)',
  }
}

export default function MarketHours() {
  const [session, setSession] = useState(() => getMarketSession())

  useEffect(() => {
    const timer = setInterval(() => setSession(getMarketSession()), 30 * 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-base-200 rounded-xl p-4 border border-base-300 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            session.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-base-content/30'
          }`}
        />
        <div>
          <p className="text-sm font-semibold text-white">
            US Market {session.isOpen ? 'Open' : 'Closed'}
          </p>
          <p className="text-xs text-base-content/50">
            09:30 - 16:00 {session.label} • {session.openWib} - {session.closeWib} WIB
          </p>
        </div>
      </div>
      <p className="text-[11px] text-base-content/40 leading-relaxed sm:max-w-md">
        Live candle hanya bergerak saat bursa buka. Di luar jam itu, subscribe tetap aktif tapi
        belum ada trade masuk. Untuk testing 24/7 bisa pakai simbol crypto seperti{' '}
        <span className="font-mono text-base-content/60">BINANCE:BTCUSDT</span>.
      </p>
    </div>
  )
}
