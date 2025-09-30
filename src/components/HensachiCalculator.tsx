'use client'

import { useState } from 'react'
import { calculateHensachi, getTweetMessage, Subject } from '@/lib/hensachi'
import RadarChart from './RadarChart'
import styles from './HensachiCalculator.module.css'

interface SubjectInput {
  id: string
  name: string
  value: string
  weight: number
  menjo: boolean
  className: string
}

const initialSubjects: SubjectInput[] = [
  { id: 'zaimu', name: '財務会計論', value: '', weight: 2, menjo: false, className: 'zaimu' },
  { id: 'kanri', name: '管理会計論', value: '', weight: 1, menjo: false, className: 'kanri' },
  { id: 'kansa', name: '監査論', value: '', weight: 1, menjo: false, className: 'kansa' },
  { id: 'hou', name: '企業法', value: '', weight: 1, menjo: false, className: 'hou' },
  { id: 'sozei', name: '租税法', value: '', weight: 1, menjo: false, className: 'sozei' },
  { id: 'sentaku', name: '経営学', value: '', weight: 1, menjo: false, className: 'sentaku' },
]

const colorMap: Record<string, string> = {
  '財務会計論': '#d32f2f',
  '管理会計論': 'orange',
  '監査論': '#0288d1',
  '企業法': '#bfa800',
  '租税法': '#8e24aa',
  '経営学': '#388e3c',
}

export default function HensachiCalculator() {
  const [subjects, setSubjects] = useState<SubjectInput[]>(initialSubjects)
  const [result, setResult] = useState<string>('')
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[]; colors: string[] } | null>(null)
  const [showTweetBtn, setShowTweetBtn] = useState(false)
  const [tweetMessage, setTweetMessage] = useState('')

  const handleValueChange = (id: string, value: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    )
  }

  const handleMenjoChange = (id: string, checked: boolean) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, menjo: checked, value: checked ? '' : s.value } : s))
    )
  }

  const handleCalculate = () => {
    const hasZenkaku = subjects.some((s) => !s.menjo && /[０-９]/.test(s.value))
    if (hasZenkaku) {
      setResult('偏差値は半角数字で入力してください。')
      setChartData(null)
      setShowTweetBtn(false)
      return
    }

    const hasEmpty = subjects.some((s) => !s.menjo && (s.value === '' || isNaN(Number(s.value))))
    if (hasEmpty) {
      setResult('偏差値を入力してください。')
      setChartData(null)
      setShowTweetBtn(false)
      return
    }

    const subjectsData: Subject[] = subjects.map((s) => ({
      name: s.name,
      value: s.menjo ? null : Number(s.value),
      weight: s.weight,
    }))

    const calcResult = calculateHensachi(subjectsData)

    if (!calcResult) {
      setResult('計算できませんでした。')
      setChartData(null)
      setShowTweetBtn(false)
      return
    }

    setResult(`総合偏差値：${calcResult.total}`)

    const labels = calcResult.subjects.map((s) => s.name)
    const data = calcResult.subjects.map((s) => s.value)
    const colors = calcResult.subjects.map((s) => colorMap[s.name] || '#000')

    setChartData({ labels, data, colors })

    const tweetSubjects = subjects
      .filter((s) => !s.menjo)
      .map((s) => ({ name: s.name, value: s.value }))
      .concat(
        subjects.filter((s) => s.menjo).map((s) => ({ name: s.name, value: '免除' }))
      )

    const tweet = getTweetMessage(calcResult.total, calcResult.hasAshikiri, tweetSubjects)
    setTweetMessage(tweet)
    setShowTweetBtn(true)
  }

  const handleTweet = () => {
    const tweet = encodeURIComponent(tweetMessage + '\n' + window.location.href)
    const xIntentUrl = `twitter://post?message=${tweet}`

    window.location.href = xIntentUrl
    setTimeout(() => {
      window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank')
    }, 800)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>論文式試験 偏差値計算</h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          各科目の偏差値を入力して計算ボタンを押すだけ。<br />
          総合偏差値とレーダーチャートを自動で表示します。
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>
          ※偏差値は半角数字で入力してください。
        </p>

        <form id="hensachiForm" autoComplete="off">
          {subjects.map((subject) => (
            <div key={subject.id} className={`${styles.card} ${styles[subject.className]}`}>
              <div className={styles.cardTitle}>
                {subject.name}
                <label className={styles.menjoLabel}>
                  <input
                    type="checkbox"
                    checked={subject.menjo}
                    onChange={(e) => handleMenjoChange(subject.id, e.target.checked)}
                  />
                  免除
                </label>
              </div>
              <input
                type="number"
                value={subject.value}
                onChange={(e) => handleValueChange(subject.id, e.target.value)}
                disabled={subject.menjo}
                min="0"
                max="100"
                inputMode="decimal"
                placeholder="偏差値を入力"
              />
            </div>
          ))}

          <button type="button" onClick={handleCalculate}>
            計算する
          </button>
        </form>

        {result && <div className={styles.result}>{result}</div>}

        {chartData && (
          <div style={{ marginTop: '1rem' }}>
            <RadarChart
              labels={chartData.labels}
              data={chartData.data}
              colors={chartData.colors}
            />
          </div>
        )}

        {showTweetBtn && (
          <>
            <button type="button" onClick={handleTweet} className={styles.tweetBtn}>
              結果をXをポスト
            </button>
            <div className={styles.screenshotMessage}>
              レーダーチャートをスクショして投稿しよう！
            </div>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <p>Produced by Redraw</p>
        <svg className={styles.logo} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1e5ba8', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M10 10 L60 10 L50 50 L0 50 Z" fill="url(#blueGradient)" />
          <path d="M40 50 L90 50 L80 90 L30 90 Z" fill="url(#blueGradient)" />
        </svg>
      </footer>
    </div>
  )
}