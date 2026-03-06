import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('浏览器不支持地理位置')
      return Promise.reject(new Error('浏览器不支持地理位置'))
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // 使用反向地理编码获取位置信息
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const locationString = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setLocation(locationString)
            setLoading(false)
            resolve(locationString)
          } catch (err) {
            // 如果反向地理编码失败，返回坐标
            const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setLocation(locationString)
            setLoading(false)
            resolve(locationString)
          }
        },
        (err) => {
          setError(err.message)
          setLoading(false)
          reject(err)
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        }
      )
    })
  }, [])

  return { location, loading, error, getLocation }
}
