import { useEffect, useRef } from 'react'

function SourceList({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="smkapp__market-sources">
      <span className="smkapp__market-sources-label">출처</span>
      <ul className="smkapp__sources">
        {sources.map((src, idx) => (
          <li key={idx}>
            {src.url ? (
              <a href={src.url} target="_blank" rel="noreferrer">
                {src.name || src.url}
              </a>
            ) : (
              src.name
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MarketChart({ market, loading = false }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!market?.has_chart || !canvasRef.current) return undefined

    const Chart = window.Chart
    if (!Chart) return undefined

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const domestic = market.domestic || []
    const globalVals = market.global_values || []
    const useDualAxis =
      globalVals.some((v) => v > 0) &&
      domestic.some((v) => v > 0) &&
      Math.max(...globalVals) > Math.max(...domestic) * 5

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: (market.years || []).map(String),
        datasets: [
          {
            label: '국내 (억원)',
            data: domestic,
            borderColor: '#aa1c41',
            backgroundColor: 'rgba(170, 28, 65, 0.08)',
            tension: 0.3,
            fill: false,
            yAxisID: 'y',
          },
          {
            label: '세계 (억원)',
            data: globalVals,
            borderColor: '#0f1b2d',
            backgroundColor: 'rgba(15, 27, 45, 0.08)',
            tension: 0.3,
            fill: false,
            yAxisID: useDualAxis ? 'y1' : 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: '연도별 시장규모 추이',
            font: { size: 13, weight: '600' },
          },
        },
        scales: {
          x: { title: { display: true, text: '연도' } },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: useDualAxis ? '국내 (억원)' : '시장규모 (억원)',
            },
          },
          ...(useDualAxis
            ? {
                y1: {
                  type: 'linear',
                  position: 'right',
                  title: { display: true, text: '세계 (억원)' },
                  grid: { drawOnChartArea: false },
                },
              }
            : {}),
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [market])

  if (loading) {
    return <p className="smkapp__smk-item-body smkapp__market-loading">시장규모 조사 중…</p>
  }

  if (!market) {
    return <p className="smkapp__smk-item-body">—</p>
  }

  const hasSummary = Boolean(market.summary?.trim())
  const hasChart = Boolean(market.has_chart && market.years?.length >= 2)

  return (
    <div className="smkapp__market">
      {hasSummary ? (
        <p className="smkapp__smk-item-body">{market.summary}</p>
      ) : !hasChart ? (
        <p className="smkapp__smk-item-body">
          확인 가능한 시장규모·성장률 수치가 없어 차트 없이 조사 요약만 표시합니다.
        </p>
      ) : null}

      {hasChart ? (
        <div className="smkapp__chart">
          <canvas ref={canvasRef} />
        </div>
      ) : null}

      <SourceList sources={market.sources} />
    </div>
  )
}
