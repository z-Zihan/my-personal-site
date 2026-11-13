import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { GeoComponent, TooltipComponent, VisualMapComponent, TitleComponent } from 'echarts/components'
import { MapChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// 按需注册 echarts（仅地图 series），替代全量引入
// @ts-ignore - core 导出在运行时存在 use 方法
echarts.use([
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  MapChart,
  CanvasRenderer,
])
import { analyticsApi } from '../../api/analytics'
import { useThemeStore } from '../../store/themeStore'
import { countryToZh } from '../../utils/countryZh'
import worldMapData from '../../data/maps/countries.geo.json'

// 兼容 echarts GeoJSON 类型
interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: unknown
  }
  properties: Record<string, unknown>
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

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

interface EChartsTooltipParams {
  name: string
  value: number | string
}

export default function VisitorMap() {
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)
  const [mapRegistered, setMapRegistered] = useState(false)
  const darkMode = useThemeStore((s) => s.darkMode)

  useEffect(() => {
    fetchCountryData()
    registerWorldMap()
  }, [])

  // 注册世界地图 - 使用本地数据
  const registerWorldMap = async () => {
    try {
      if (worldMapData && worldMapData.features && worldMapData.features.length > 0) {
        // @ts-ignore - echarts registerMap 类型定义过于严格
        echarts.registerMap('world', worldMapData)
        setMapRegistered(true)
      } else {
        // @ts-ignore
        echarts.registerMap('world', {
          type: 'FeatureCollection',
          features: [],
        })
        setMapRegistered(true)
      }
    } catch (error) {
      // @ts-ignore
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
          text: '访客地域分布',
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
        text: '访客地域分布',
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
        formatter: (params: unknown) => {
          const p = params as EChartsTooltipParams
          const zh = countryToZh(p.name)
          if (!p.value || p.value === 0) return `${zh}: 暂无数据`
          const codeLine = zh === p.name ? '' : `<br/>代码：${p.name}`
          return `${zh}${codeLine}<br/>访客数：${p.value}`
        },
        backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: '#7000ff',
        borderWidth: 1,
        textStyle: {
          color: darkMode ? 'rgba(255,255,255,0.85)' : '#333',
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        left: 'left',
        bottom: 20,
        text: ['多', '少'],
        inRange: {
          color: darkMode ? ['#26262b', '#4a3a7a', '#7000ff', '#a85fff'] : ['#e8e8e8', '#b37feb', '#7000ff', '#4a00b3'],
        },
        textStyle: {
          color: darkMode ? 'rgba(255,255,255,0.45)' : '#666',
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
          color: darkMode ? 'rgba(255,255,255,0.65)' : '#666',
        },
        itemstyle: {
          areaColor: darkMode ? '#262629' : '#f5f5f5',
          borderColor: darkMode ? '#3a3a3e' : '#d9d9d9',
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
          background: darkMode ? '#26262b' : 'linear-gradient(135deg, #f0f2f5 0%, #e8e4ff 100%)',
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
          <p style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : '#666', marginTop: 24, textAlign: 'center', fontSize: 14 }}>加载地图数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 8, padding: 16 }}>
      <ReactECharts echarts={echarts} option={getOption()} style={{ height: 450 }} opts={{ renderer: 'svg' }} notMerge={true} />
    </div>
  )
}
