'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/admin/ui/Button'
import api from '@/lib/api'
import styles from './SettingsForm.module.css'

const categoryNames = {
  general: '일반 설정',
  security: '보안 설정',
  notification: '알림 설정',
  feature: '기능 설정'
}

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [originalSettings, setOriginalSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)
  const [message, setMessage] = useState(null)

  // 설정 불러오기
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/admin/settings')

      if (data.success) {
        setSettings(data.data)
        setOriginalSettings(JSON.parse(JSON.stringify(data.data)))
      }
    } catch (error) {
      console.error('설정 불러오기 실패:', error)
      setMessage({ type: 'error', text: '설정을 불러오는 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // 설정 값 변경
  const handleChange = (category, key, value, type) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          value: type === 'boolean' ? value === 'true' : value
        }
      }
    }))
  }

  // 설정 저장
  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // 변경된 설정만 추출
      const changedSettings = []
      Object.keys(settings).forEach(category => {
        Object.keys(settings[category]).forEach(key => {
          if (settings[category][key].value !== originalSettings[category][key].value) {
            changedSettings.push({
              key,
              value: settings[category][key].value
            })
          }
        })
      })

      if (changedSettings.length === 0) {
        setMessage({ type: 'info', text: '변경된 설정이 없습니다.' })
        return
      }

      const data = await api.put('/api/admin/settings', {
        settings: changedSettings
      })

      if (data.success) {
        setMessage({ type: 'success', text: `${data.updated}개의 설정이 업데이트되었습니다.` })
        setOriginalSettings(JSON.parse(JSON.stringify(settings)))
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      console.error('설정 저장 실패:', error)
      setMessage({ type: 'error', text: '설정을 저장하는 중 오류가 발생했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  // 캐시 초기화
  const handleClearCache = async () => {
    if (!confirm('캐시를 초기화하시겠습니까?')) return

    try {
      setClearingCache(true)
      const data = await api.post('/api/admin/settings/cache/clear')

      if (data.success) {
        setMessage({ type: 'success', text: '캐시가 초기화되었습니다.' })
        await fetchSettings() // 재조회
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      console.error('캐시 초기화 실패:', error)
      setMessage({ type: 'error', text: '캐시 초기화 중 오류가 발생했습니다.' })
    } finally {
      setClearingCache(false)
    }
  }

  // 초기화
  const handleReset = () => {
    if (!confirm('변경 사항을 취소하시겠습니까?')) return
    setSettings(JSON.parse(JSON.stringify(originalSettings)))
    setMessage({ type: 'info', text: '변경 사항이 취소되었습니다.' })
  }

  if (loading) {
    return <div className={styles.loading}>설정을 불러오는 중...</div>
  }

  const currentSettings = settings[activeTab] || {}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          {Object.keys(categoryNames).map(category => (
            <button
              key={category}
              className={`${styles.tab} ${activeTab === category ? styles.active : ''}`}
              onClick={() => setActiveTab(category)}
            >
              {categoryNames[category]}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="small"
            onClick={handleClearCache}
            loading={clearingCache}
          >
            🔄 캐시 초기화
          </Button>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.form}>
        {Object.keys(currentSettings).map(key => {
          const setting = currentSettings[key]
          return (
            <div key={key} className={styles.field}>
              <label className={styles.label}>
                {setting.description || key}
              </label>

              {setting.type === 'boolean' ? (
                <select
                  value={String(setting.value)}
                  onChange={(e) => handleChange(activeTab, key, e.target.value, setting.type)}
                  className={styles.select}
                >
                  <option value="true">사용</option>
                  <option value="false">사용 안함</option>
                </select>
              ) : setting.type === 'number' ? (
                <input
                  type="number"
                  value={setting.value}
                  onChange={(e) => handleChange(activeTab, key, e.target.value, setting.type)}
                  className={styles.input}
                />
              ) : (
                <input
                  type="text"
                  value={setting.value}
                  onChange={(e) => handleChange(activeTab, key, e.target.value, setting.type)}
                  className={styles.input}
                />
              )}

              <div className={styles.meta}>
                키: {key} | 타입: {setting.type}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <Button variant="outline" onClick={handleReset}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          저장
        </Button>
      </div>
    </div>
  )
}

