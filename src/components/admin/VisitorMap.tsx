import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { analyticsApi } from '../../api/analytics'
import worldMapData from '../../data/maps/countries.geo.json'

interface CountryData {
  name: string
  value: number
}

interface AnalyticsCountry {
  name?: string
  country?: string
  visitors?: number
  value?: number
}

export default function VisitorMap() {
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)
  const [mapRegistered, setMapRegistered] = useState(false)

  useEffect(() => {
    fetchCountryData()
    registerWorldMap()
  }, [])

  // 注册世界地图 - 使用本地数据
  const registerWorldMap = async () => {
    try {
      if (worldMapData && worldMapData.features && worldMapData.features.length > 0) {
        echarts.registerMap('world', worldMapData as any)
        setMapRegistered(true)
      } else {
        console.warn('Local map data invalid, using empty fallback')
        echarts.registerMap('world', {
          type: 'FeatureCollection',
          features: [],
        })
        setMapRegistered(true)
      }
    } catch (error) {
      console.error('Map register failed:', error)
      echarts.registerMap('world', {
        type: 'FeatureCollection',
        features: [],
      })
      setMapRegistered(true)
    }
  }

  const fetchCountryData = async () => {
    try {
      const { data } = await analyticsApi.getCountries(30)
      const countries = (data as { data?: AnalyticsCountry[] })?.data || (data as AnalyticsCountry[]) || []

      // 转换为 ECharts 格式
      let formattedData: CountryData[] = []
      if (Array.isArray(countries)) {
        formattedData = countries
          .filter((item) => (item.visitors || item.value || 0) > 0)
          .map((item) => ({
            name: item.name || item.country || '',
            value: item.visitors || item.value || 0,
          }))
      }

      // 如果没有数据，使用模拟数据用于演示
      if (formattedData.length === 0) {
        formattedData = [
          { name: 'China', value: 150 },
          { name: 'United States', value: 80 },
          { name: 'Japan', value: 45 },
          { name: 'Germany', value: 30 },
          { name: 'United Kingdom', value: 25 },
          { name: 'France', value: 20 },
          { name: 'Canada', value: 15 },
          { name: 'Australia', value: 12 },
          { name: 'Brazil', value: 10 },
          { name: 'India', value: 8 },
        ]
      }

      setCountryData(formattedData)
    } catch (error) {
      console.error('Fetch country data error:', error)
      // 使用模拟数据用于演示
      setCountryData([
        { name: 'China', value: 150 },
        { name: 'United States', value: 80 },
        { name: 'Japan', value: 45 },
        { name: 'Germany', value: 30 },
        { name: 'United Kingdom', value: 25 },
        { name: 'France', value: 20 },
        { name: 'Canada', value: 15 },
        { name: 'Australia', value: 12 },
        { name: 'Brazil', value: 10 },
        { name: 'India', value: 8 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getOption = () => {
    // 如果地图未注册或没有数据，显示简单提示
    if (!mapRegistered) {
      return {
        title: {
          text: '🌍 访客地域分布',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#7000ff',
            fontSize: 16,
          },
        },
        series: [],
      }
    }

    return {
      title: {
        text: '🌍 访客地域分布',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#7000ff',
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.value || params.value === 0) return `${params.name}: 暂无数据`
          return `${params.name}<br/>访客数：${params.value}`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#7000ff',
        borderWidth: 1,
        textStyle: {
          color: '#333',
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        left: 'left',
        bottom: 20,
        text: ['多', '少'],
        inRange: {
          color: ['#e8e8e8', '#b37feb', '#7000ff', '#4a00b3'],
        },
        textStyle: {
          color: '#666',
        },
        calculable: true,
      },
      geo: {
        map: 'world',
        type: 'map',
        zoom: 1.2,
        center: [0, 10],
        label: {
          show: false,
          color: '#666',
        },
        itemstyle: {
          areaColor: '#f5f5f5',
          borderColor: '#d9d9d9',
          borderWidth: 0.5,
        },
        emphasis: {
          label: {
            show: false,
          },
          itemstyle: {
            areaColor: '#00f0ff',
          },
        },
        select: {
          itemstyle: {
            areaColor: '#7000ff',
          },
        },
      },
      series: [
        {
          name: '访客数',
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: countryData,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
          },
        },
      ],
    }
  }

  if (loading) {
    return (
      <div
        style={{
          height: 450,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0f2f5 0%, #e8e4ff 100%)',
          borderRadius: 8,
        }}
      >
        <div className="relative">
          {/* 地球仪风格加载器 */}
          <div
            className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"
            style={{ animationDuration: '2s', borderLeftColor: '#7000ff', borderTopColor: '#00f0ff' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-cyan-200 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse', borderRightColor: '#00f0ff' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full shadow-lg shadow-purple-500/50" />
          <p style={{ color: '#666', marginTop: 24, textAlign: 'center', fontSize: 14 }}>加载地图数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: 8, padding: 16 }}>
      <ReactECharts option={getOption()} style={{ height: 450 }} opts={{ renderer: 'svg' }} notMerge={true} />
    </div>
  )
}
