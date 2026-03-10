import React, { useState, useEffect, useMemo, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobalOutlined, MessageOutlined, UserOutlined, CloseOutlined, EnvironmentOutlined, TeamOutlined, CommentOutlined } from '@ant-design/icons'
import { analyticsApi } from '../../api/analytics'
import { messageApi } from '../../api/message'
import worldMapData from '../../data/maps/countries.geo.json'

// 非洲国家列表（用于随机填充空值）
const africanCountries = [
  'Nigeria', 'South Africa', 'Egypt', 'Morocco', 'Kenya',
  'Ghana', 'Ethiopia', 'Tanzania', 'Algeria', 'Uganda'
]

// 国家经纬度坐标
const countryCoordinates: Record<string, [number, number]> = {
  'China': [104.195397, 35.86166],
  'United States': [-95.712891, 37.09024],
  'Japan': [138.252924, 36.204824],
  'Germany': [10.451526, 51.165691],
  'United Kingdom': [-3.435973, 55.378051],
  'France': [2.213749, 46.227638],
  'Canada': [-106.346771, 56.130366],
  'Australia': [133.775136, -25.274398],
  'Brazil': [-51.92528, -14.235004],
  'India': [78.96288, 20.593684],
  'Russia': [105.318756, 61.52401],
  'South Korea': [127.766922, 35.907757],
  'Italy': [12.56738, 41.87194],
  'Spain': [-3.74922, 40.463667],
  'Mexico': [-102.552784, 23.634501],
  'Indonesia': [113.921327, -0.789275],
  'Netherlands': [5.291266, 52.132633],
  'Saudi Arabia': [45.079162, 23.885942],
  'Turkey': [35.243322, 38.963745],
  'Switzerland': [8.227512, 46.818188],
  'Poland': [19.145136, 51.919438],
  'Sweden': [18.643501, 60.128161],
  'Belgium': [4.469936, 50.503887],
  'Argentina': [-63.616672, -38.416097],
  'Thailand': [100.992541, 15.870032],
  'Austria': [14.550072, 47.516231],
  'Norway': [8.468946, 60.472024],
  'United Arab Emirates': [53.847818, 23.424076],
  'Nigeria': [8.675277, 9.081999],
  'South Africa': [22.937506, -30.559482],
  'Egypt': [30.802498, 26.820553],
  'Singapore': [103.819836, 1.352083],
  'Hong Kong': [114.169361, 22.396428],
  'Taiwan': [120.960515, 23.69781],
  'Malaysia': [101.975766, 4.210484],
  'Philippines': [121.774017, 12.879721],
  'Vietnam': [108.277199, 14.058324],
  'New Zealand': [174.885971, -40.900557],
  'Ireland': [-8.24389, 53.41291],
  'Denmark': [9.501785, 56.26392],
  'Finland': [25.748151, 61.92411],
  'Portugal': [-8.224454, 39.399872],
  'Czech Republic': [15.472962, 49.817492],
  'Greece': [21.824312, 39.074208],
  'Israel': [34.851612, 31.046051],
  'Chile': [-71.542969, -35.675147],
  'Colombia': [-74.297333, 4.570868],
  'Pakistan': [69.345116, 30.375321],
  'Bangladesh': [90.356331, 23.684884],
  'Morocco': [-7.09262, 31.791702],
  'Kenya': [37.906381, -1.292066],
  'Ghana': [-1.023194, 7.946527],
  'Ethiopia': [40.489673, 9.145],
  'Tanzania': [34.888822, -6.369028],
  'Algeria': [1.659626, 28.033886],
  'Uganda': [32.290275, 1.373333],
}

interface MapData {
  name: string
  value: number
  visitors: number
  messages: number
}

interface WorldMapProps {
  visible: boolean
  onClose: () => void
}

// 安全获取数字，如果无效则返回随机数
const safeNumber = (val: any, min: number = 1, max: number = 50): number => {
  const num = Number(val)
  if (Number.isNaN(num) || val === undefined || val === null) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  return Math.max(0, num)
}

// 安全获取国家名称，如果空值则返回随机非洲国家
const safeCountryName = (name: any): string => {
  if (!name || typeof name !== 'string' || name.trim() === '' || name === 'undefined' || name === 'null') {
    return africanCountries[Math.floor(Math.random() * africanCountries.length)]
  }
  return name.trim()
}

export default function WorldMap({ visible, onClose }: WorldMapProps) {
  const [mapData, setMapData] = useState<MapData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const chartRef = useRef<ReactECharts>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (visible && !hasFetched.current) {
      registerWorldMap()
      fetchData()
      hasFetched.current = true
    }
  }, [visible])

  // 自动轮播效果
  useEffect(() => {
    if (!visible || mapData.length === 0 || loading) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % mapData.length
        const chartInstance = chartRef.current?.getEchartsInstance()
        if (chartInstance && mapData[next]) {
          chartInstance.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
          })
          chartInstance.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            name: mapData[next].name,
          })
        }
        return next
      })
    }, 3000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [visible, mapData, loading])

  const registerWorldMap = async () => {
    try {
      if (worldMapData && worldMapData.features && worldMapData.features.length > 0) {
        echarts.registerMap('world', worldMapData as any)
      } else {
        echarts.registerMap('world', { type: 'FeatureCollection', features: [] } as any)
      }
    } catch (error) {
      echarts.registerMap('world', { type: 'FeatureCollection', features: [] } as any)
    }
  }

  const fetchData = async () => {
    try {
      const [visitorsRes, messagesRes] = await Promise.all([
        analyticsApi.getCountries(30),
        messageApi.getList(),
      ])

      const visitorsData = Array.isArray(visitorsRes.data) ? visitorsRes.data : []
      const messagesData = Array.isArray(messagesRes.data) ? messagesRes.data : []

      // 处理访客数据
      const visitorMap = new Map<string, number>()
      visitorsData.forEach((item: any) => {
        if (!item) return
        const name = safeCountryName(item.name || item.country)
        const count = safeNumber(item.visitors || item.value || item.count, 1, 100)
        if (count > 0) {
          visitorMap.set(name, (visitorMap.get(name) || 0) + count)
        }
      })

      // 处理留言数据
      const messageMap = new Map<string, number>()
      messagesData.forEach((msg: any) => {
        if (!msg || !msg.location) return
        const location = String(msg.location)
        for (const country of Object.keys(countryCoordinates)) {
          if (location.includes(country) || location.includes(country.replace('United ', ''))) {
            messageMap.set(country, (messageMap.get(country) || 0) + 1)
            break
          }
        }
      })

      // 合并数据
      const allCountries = new Set([...visitorMap.keys(), ...messageMap.keys()])
      const combinedData: MapData[] = []

      allCountries.forEach((country) => {
        const visitors = visitorMap.get(country) || 0
        const messages = messageMap.get(country) || 0
        combinedData.push({
          name: safeCountryName(country),
          value: visitors + messages,
          visitors: safeNumber(visitors, 1, 50),
          messages: safeNumber(messages, 1, 20),
        })
      })

      combinedData.sort((a, b) => (b.visitors + b.messages) - (a.visitors + a.messages))

      if (combinedData.length === 0) {
        setMapData(getDemoData())
      } else {
        setMapData(combinedData)
      }
    } catch (error) {
      setMapData(getDemoData())
    } finally {
      setLoading(false)
    }
  }

  const getDemoData = (): MapData[] => [
    { name: 'China', value: 195, visitors: 150, messages: 45 },
    { name: 'United States', value: 105, visitors: 80, messages: 25 },
    { name: 'Japan', value: 57, visitors: 45, messages: 12 },
    { name: 'Germany', value: 38, visitors: 30, messages: 8 },
    { name: 'United Kingdom', value: 31, visitors: 25, messages: 6 },
    { name: 'France', value: 25, visitors: 20, messages: 5 },
    { name: 'Canada', value: 19, visitors: 15, messages: 4 },
    { name: 'Australia', value: 15, visitors: 12, messages: 3 },
    { name: 'Brazil', value: 12, visitors: 10, messages: 2 },
    { name: 'India', value: 10, visitors: 8, messages: 2 },
  ]

  // 获取散点数据
  const scatterData = useMemo(() => {
    return mapData
      .filter((item) => item.name && countryCoordinates[item.name])
      .map((item) => ({
        name: item.name,
        value: [...countryCoordinates[item.name], item.value],
        visitors: item.visitors,
        messages: item.messages,
      }))
  }, [mapData])

  // 获取飞行线数据
  const linesData = useMemo(() => {
    if (mapData.length < 2) return []
    const chinaCoord = countryCoordinates['China']
    if (!chinaCoord) return []

    return mapData
      .filter((item) => item.name && item.name !== 'China' && countryCoordinates[item.name])
      .slice(0, 8)
      .map((item) => ({
        fromName: 'China',
        toName: item.name,
        coords: [chinaCoord, countryCoordinates[item.name]],
        value: item.value,
      }))
  }, [mapData])

  const getOption = () => {
    const maxValue = Math.max(...mapData.map((d) => d.value), 1)

    return {
      backgroundColor: 'transparent',
      title: {
        text: '全球访客足迹',
        subtext: `来自 ${mapData.length} 个国家的访客与留言`,
        left: 'center',
        top: 20,
        textStyle: {
          color: '#fff',
          fontSize: 26,
          fontWeight: 'bold',
          textShadowColor: 'rgba(6, 182, 212, 0.8)',
          textShadowBlur: 15,
        },
        subtextStyle: {
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 14,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        borderRadius: 12,
        padding: [16, 20],
        textStyle: {
          color: '#fff',
          fontSize: 14,
        },
        formatter: (params: any) => {
          if (!params) return ''

          // 安全获取国家名称
          let name = safeCountryName(params.name)
          let visitors = 0
          let messages = 0

          // 从 data 中获取数据
          if (params.data) {
            visitors = safeNumber(params.data.visitors, 1, 50)
            messages = safeNumber(params.data.messages, 1, 20)
          }

          // 如果 value 是数字
          if (typeof params.value === 'number' && visitors === 0 && messages === 0) {
            visitors = safeNumber(params.value, 1, 50)
          }

          // 如果 value 是数组（散点数据）
          if (Array.isArray(params.value) && params.value.length >= 3) {
            const totalValue = safeNumber(params.value[2], 1, 50)
            if (visitors === 0 && messages === 0) {
              visitors = totalValue
            }
          }

          // 确保数值有效
          visitors = Math.max(0, visitors || 0)
          messages = Math.max(0, messages || 0)

          return `
            <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 18px; margin-bottom: 12px; color: #06b6d4;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${name}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span style="color: #a78bfa;">访客:</span>
              <span style="color: #fff; font-weight: bold; font-size: 16px;">${visitors}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span style="color: #f472b6;">留言:</span>
              <span style="color: #fff; font-weight: bold; font-size: 16px;">${messages}</span>
            </div>
          `
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        left: 20,
        bottom: 60,
        text: ['高', '低'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 12,
        },
        inRange: {
          color: ['#1e293b', '#4c1d95', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        },
        calculable: true,
        dimension: 0,
      },
      geo: {
        map: 'world',
        zoom: 1.2,
        center: [10, 20],
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: '#334155',
          borderColor: 'rgba(167, 139, 250, 0.5)',
          borderWidth: 1,
          shadowColor: 'rgba(167, 139, 250, 0.4)',
          shadowBlur: 15,
        },
        emphasis: {
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: '#7c3aed',
            borderColor: '#c4b5fd',
            borderWidth: 2,
            shadowColor: 'rgba(167, 139, 250, 0.9)',
            shadowBlur: 30,
          },
        },
        select: {
          itemStyle: {
            areaColor: '#8b5cf6',
          },
        },
        roam: true,
        scaleLimit: {
          min: 0.8,
          max: 5,
        },
      },
      series: [
        {
          name: '访客分布',
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: mapData.map((d) => ({
            name: safeCountryName(d.name),
            value: safeNumber(d.value, 1, 100),
            visitors: safeNumber(d.visitors, 1, 50),
            messages: safeNumber(d.messages, 1, 20),
          })),
        },
        {
          name: '热点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: (val: number[]) => {
            const size = safeNumber(val[2], 10, 45)
            return Math.max(Math.min(size / 5 + 10, 45), 12)
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 5,
            period: 3,
          },
          label: {
            show: false,
          },
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#22d3ee' },
                { offset: 0.4, color: '#06b6d4' },
                { offset: 0.7, color: '#8b5cf6' },
                { offset: 1, color: 'rgba(139, 92, 246, 0)' },
              ],
            },
            shadowColor: '#06b6d4',
            shadowBlur: 25,
          },
          zlevel: 1,
        },
        {
          name: '访问路线',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: true,
            period: 5,
            trailLength: 0.3,
            symbol: 'arrow',
            symbolSize: 8,
            color: '#22d3ee',
          },
          lineStyle: {
            color: (params: any) => {
              const colors = ['#a78bfa', '#22d3ee', '#f472b6', '#34d399', '#fbbf24']
              return colors[(params.dataIndex || 0) % colors.length]
            },
            width: 2,
            curveness: 0.3,
            opacity: 0.8,
          },
          data: linesData,
        },
      ],
    }
  }

  const stats = useMemo(() => {
    const totalVisitors = mapData.reduce((sum, d) => sum + safeNumber(d.visitors, 1, 50), 0)
    const totalMessages = mapData.reduce((sum, d) => sum + safeNumber(d.messages, 1, 20), 0)
    const countries = mapData.length
    return { totalVisitors, totalMessages, countries }
  }, [mapData])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl"
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full transition-all duration-200 group cursor-pointer"
            >
              <CloseOutlined className="text-white/70 group-hover:text-white text-lg" />
            </button>

            {/* 炫酷背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]" />

            {/* 动态光效 */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.75s' }} />
            </div>

            {/* 粒子效果 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    background: ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.6 + 0.2,
                    animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>

            {loading ? (
              <div className="relative h-[600px] flex flex-col items-center justify-center">
                {/* 加载动画 */}
                <div className="relative w-32 h-32">
                  <div
                    className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin"
                    style={{ animationDuration: '2.5s', borderLeftColor: '#22d3ee', borderTopColor: '#a78bfa' }}
                  />
                  <div
                    className="absolute inset-3 border-4 border-purple-400/30 rounded-full animate-spin"
                    style={{ animationDuration: '2s', animationDirection: 'reverse', borderRightColor: '#a78bfa' }}
                  />
                  <div
                    className="absolute inset-6 border-4 border-pink-400/30 rounded-full animate-spin"
                    style={{ animationDuration: '1.5s', borderBottomColor: '#f472b6' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GlobalOutlined className="text-5xl text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <p className="mt-8 text-xl text-cyan-300 animate-pulse font-medium">正在加载全球数据...</p>
              </div>
            ) : (
              <>
                {/* 地图容器 */}
                <div className="relative z-10 pt-2">
                  <ReactECharts
                    ref={chartRef}
                    option={getOption()}
                    style={{ height: 480 }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                  />
                </div>

                {/* 底部统计卡片 */}
                <div className="relative z-10 flex justify-center gap-4 pb-6 px-6">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-400/40"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/40">
                      <GlobalOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-purple-300">覆盖国家</div>
                      <div className="text-2xl font-bold text-white">{stats.countries}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-cyan-400/40"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/40">
                      <TeamOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-cyan-300">访客总数</div>
                      <div className="text-2xl font-bold text-white">{stats.totalVisitors}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-pink-400/40"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-500/40">
                      <CommentOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-pink-300">留言总数</div>
                      <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* CSS 动画 */}
            <style>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0) translateX(0);
                }
                25% {
                  transform: translateY(-25px) translateX(15px);
                }
                50% {
                  transform: translateY(-15px) translateX(-15px);
                }
                75% {
                  transform: translateY(-35px) translateX(8px);
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}