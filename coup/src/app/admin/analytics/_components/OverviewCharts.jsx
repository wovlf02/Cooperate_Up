'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Badge from '@/components/admin/ui/Badge'
import api from '@/lib/api'
import styles from './OverviewCharts.module.css'

export default function OverviewCharts() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const result = await api.get('/api/admin/analytics/overview')
      setData(result.data)
    } catch (err) {
      console.error('통계 조회 오류:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>통계를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>통계를 불러올 수 없습니다: {error}</div>
      </div>
    )
  }

  if (!data) return null

  const { summary, trends } = data

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>전체 통계 개요</h2>

      {/* 요약 카드 */}
      <div className={styles.cards}>
        {/* 사용자 카드 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>사용자</h3>
            <Badge variant={summary.users.growth >= 0 ? 'success' : 'danger'}>
              {summary.users.growth >= 0 ? '+' : ''}{summary.users.growth}%
            </Badge>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.mainStat}>
              <span className={styles.number}>{summary.users.total.toLocaleString()}</span>
              <span className={styles.label}>전체</span>
            </div>
            <div className={styles.subStats}>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.users.active.toLocaleString()}</span>
                <span className={styles.subLabel}>활성</span>
              </div>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.users.suspended.toLocaleString()}</span>
                <span className={styles.subLabel}>정지</span>
              </div>
            </div>
          </div>
        </div>

        {/* 스터디 카드 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>스터디</h3>
            <Badge variant={summary.studies.growth >= 0 ? 'success' : 'danger'}>
              {summary.studies.growth >= 0 ? '+' : ''}{summary.studies.growth}%
            </Badge>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.mainStat}>
              <span className={styles.number}>{summary.studies.total.toLocaleString()}</span>
              <span className={styles.label}>전체</span>
            </div>
            <div className={styles.subStats}>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.studies.public.toLocaleString()}</span>
                <span className={styles.subLabel}>공개</span>
              </div>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.studies.recruiting.toLocaleString()}</span>
                <span className={styles.subLabel}>모집중</span>
              </div>
            </div>
          </div>
        </div>

        {/* 신고 카드 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>신고</h3>
            <Badge variant="info">
              {summary.reports.resolution_rate}% 해결
            </Badge>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.mainStat}>
              <span className={styles.number}>{summary.reports.total.toLocaleString()}</span>
              <span className={styles.label}>전체</span>
            </div>
            <div className={styles.subStats}>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.reports.pending.toLocaleString()}</span>
                <span className={styles.subLabel}>대기</span>
              </div>
              <div className={styles.subStat}>
                <span className={styles.subNumber}>{summary.reports.in_progress.toLocaleString()}</span>
                <span className={styles.subLabel}>처리중</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 추이 차트 */}
      <div className={styles.charts}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>일일 가입자 수 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.dailySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
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
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>일일 스터디 생성 수 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.dailyStudies}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
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
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>일일 신고 접수 수 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.dailyReports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
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
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
                name="신고 수"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

