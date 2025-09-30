'use client'

import { useEffect, useRef } from 'react'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface RadarChartProps {
  labels: string[]
  data: number[]
  colors: string[]
}

export default function RadarChart({ labels, data, colors }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // 既存のチャートを破棄
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const labelColors: Record<string, string> = {}
    labels.forEach((label, idx) => {
      labelColors[label] = colors[idx] || '#222'
    })

    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '偏差値',
            data: data,
            backgroundColor: 'rgba(0,123,255,0.2)',
            borderColor: 'rgba(0,123,255,1)',
            pointBackgroundColor: 'rgba(0,123,255,1)',
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          r: {
            min: 20,
            max: 70,
            ticks: {
              stepSize: 10,
              color: '#666',
              font: {
                size: 12,
                family: "'Crimson Text', 'Noto Serif JP', serif",
              },
            },
            pointLabels: {
              font: {
                size: 13,
                family: "'Crimson Text', 'Noto Serif JP', serif",
              },
              color: (context) => {
                const label = labels[context.index]
                return labelColors[label] || '#222'
              },
            },
          },
        },
      },
      plugins: [
        {
          id: 'valueDisplay',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx
            const chartData = chart.data.datasets[0].data

            ctx.save()
            ctx.font = "bold 14px 'Crimson Text', 'Noto Serif JP', serif"
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            chartData.forEach((value, index) => {
              if (typeof value !== 'number') return

              const meta = chart.getDatasetMeta(0)
              const point = meta.data[index]

              if (point && value !== null && value !== undefined) {
                const x = point.x
                const y = point.y

                const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2
                const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2

                const angle = Math.atan2(y - centerY, x - centerX)

                const offsetDistance = 20
                const textX = x + Math.cos(angle) * offsetDistance
                const textY = y + Math.sin(angle) * offsetDistance

                // 背景の円
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                ctx.beginPath()
                ctx.arc(textX, textY, 12, 0, 2 * Math.PI)
                ctx.fill()

                // 枠線
                const label = labels[index]
                ctx.strokeStyle = labelColors[label] || 'rgba(0,123,255,0.8)'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(textX, textY, 15, 0, 2 * Math.PI)
                ctx.stroke()

                // 数値
                ctx.fillStyle = '#333'
                ctx.fillText(value.toString(), textX, textY)
              }
            })

            ctx.restore()
          },
        },
      ],
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [labels, data, colors])

  return <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
}