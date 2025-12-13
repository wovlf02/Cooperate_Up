'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import api from '@/lib/api'
import styles from './StudyAnalytics.module.css'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function StudyAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('daily')
  const [range, setRange] = useState(30)

  const fetchStudyAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const result = await api.get('/api/admin/analytics/studies', {
        period,
        range
      })
      setData(result.data)
    } catch (err) {
      console.error('스터디 분석 조회 오류:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [period, range])

  useEffect(() => {
    fetchStudyAnalytics()
  }, [fetchStudyAnalytics])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>스터디 분석을 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>스터디 분석을 불러올 수 없습니다: {error}</div>
      </div>
    )
  }

  if (!data) return null

  const {
    creationTrend,
    categoryDistribution,
    membershipStats,
    activeRatio,
    visibilityDistribution,
    recruitmentStatus
  } = data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>스터디 분석</h2>
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

      {/* 멤버십 통계 카드 */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>평균 멤버 수</div>
          <div className={styles.statValue}>{membershipStats.avg}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>최소 멤버 수</div>
          <div className={styles.statValue}>{membershipStats.min}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>최대 멤버 수</div>
          <div className={styles.statValue}>{membershipStats.max}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 멤버 수</div>
          <div className={styles.statValue}>{membershipStats.total.toLocaleString()}</div>
        </div>
      </div>

      {/* 활성 비율 */}
      <div className={styles.activeRatioSection}>
        <h3 className={styles.sectionTitle}>활성 스터디 비율</h3>
        <div className={styles.ratioBar}>
          <div
            className={styles.ratioFill}
            style={{ width: `${activeRatio.ratio}%` }}
          >
            {activeRatio.ratio}%
          </div>
        </div>
        <div className={styles.ratioStats}>
          <div className={styles.ratioStat}>
            <span className={styles.ratioLabel}>활성</span>
            <span className={styles.ratioValue}>{activeRatio.active.toLocaleString()}</span>
          </div>
          <div className={styles.ratioStat}>
            <span className={styles.ratioLabel}>비활성</span>
            <span className={styles.ratioValue}>{activeRatio.inactive.toLocaleString()}</span>
          </div>
          <div className={styles.ratioStat}>
            <span className={styles.ratioLabel}>전체</span>
            <span className={styles.ratioValue}>{activeRatio.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartsGrid}>
        {/* 생성 추이 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>스터디 생성 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={creationTrend}>
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
                stroke="#10b981"
                strokeWidth={2}
                name="스터디 수"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 분포 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>카테고리별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" name="스터디 수">
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 공개/비공개 분포 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>공개 여부 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visibilityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {visibilityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {visibilityDistribution.map((item, index) => (
              <div key={item.type} className={styles.legendItem}>
                <span
                  className={styles.legendColor}
                  style={{ backgroundColor: index === 0 ? '#10b981' : '#6366f1' }}
                />
                <span className={styles.legendLabel}>{item.name}</span>
                <span className={styles.legendValue}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 모집 현황 */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>모집 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={recruitmentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {recruitmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {recruitmentStatus.map((item, index) => (
              <div key={item.type} className={styles.legendItem}>
                <span
                  className={styles.legendColor}
                  style={{ backgroundColor: index === 0 ? '#f59e0b' : '#94a3b8' }}
                />
                <span className={styles.legendLabel}>{item.name}</span>
                <span className={styles.legendValue}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

