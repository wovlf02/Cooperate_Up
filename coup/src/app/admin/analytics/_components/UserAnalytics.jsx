'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import api from '@/lib/api'
import styles from './UserAnalytics.module.css'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function UserAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('daily')
  const [range, setRange] = useState(30)

  const fetchUserAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const result = await api.get('/api/admin/analytics/users', {
        period,
        range
      })
      setData(result.data)
    } catch (err) {
      console.error('사용자 분석 조회 오류:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [period, range])

  useEffect(() => {
    fetchUserAnalytics()
  }, [fetchUserAnalytics])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>사용자 분석을 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>사용자 분석을 불러올 수 없습니다: {error}</div>
      </div>
    )
  }

  if (!data) return null

  const {
    signupTrend,
    providerDistribution,
    activityMetrics,
    sanctions,
    statusDistribution
  } = data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>사용자 분석</h2>
        <div className={styles.controls}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.select}
          >
            <option value="daily">일별</option>
            <option value="weekly">주별</option>
            <option value="monthly">월별</option>
          </select>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className={styles.select}
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>
      </div>

      {/* 활동 메트릭 카드 */}
      <div className={styles.metricsCards}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>DAU</div>
          <div className={styles.metricValue}>{activityMetrics.dau.toLocaleString()}</div>
          <div className={styles.metricDesc}>일간 활성 사용자</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>WAU</div>
          <div className={styles.metricValue}>{activityMetrics.wau.toLocaleString()}</div>
          <div className={styles.metricDesc}>주간 활성 사용자</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>MAU</div>
          <div className={styles.metricValue}>{activityMetrics.mau.toLocaleString()}</div>
          <div className={styles.metricDesc}>월간 활성 사용자</div>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartsGrid}>
        {/* 가입 추이 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>가입 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signupTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (period === 'monthly') {
                    return value
                  }
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                name="가입자 수"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 가입 방식 분포 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>가입 방식 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={providerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {providerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {providerDistribution.map((item, index) => (
              <div key={item.provider} className={styles.legendItem}>
                <span
                  className={styles.legendColor}
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className={styles.legendLabel}>{item.name}</span>
                <span className={styles.legendValue}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 제재 현황 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>제재 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: '경고 누적', value: sanctions.warnings, color: '#f59e0b' },
                { name: '일시 정지', value: sanctions.suspensions, color: '#ef4444' },
                { name: '영구 정지', value: sanctions.bans, color: '#991b1b' }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" name="사용자 수">
                {[
                  { name: '경고 누적', value: sanctions.warnings, color: '#f59e0b' },
                  { name: '일시 정지', value: sanctions.suspensions, color: '#ef4444' },
                  { name: '영구 정지', value: sanctions.bans, color: '#991b1b' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 상태별 분포 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>사용자 상태 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" name="사용자 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

