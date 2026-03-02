import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import axios from 'axios';

const GEO_URL = 'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

export default function VisitorMap() {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryData();
  }, []);

  const fetchCountryData = async () => {
    try {
      const { data } = await axios.get('/api/analytics?type=countries&days=30');
      setCountryData(data.data || data);
    } catch (error) {
      console.error('Fetch country data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryValue = (countryName) => {
    const found = countryData.find(d => 
      d.name?.toLowerCase().includes(countryName.toLowerCase()) ||
      d.country?.toLowerCase().includes(countryName.toLowerCase())
    );
    return found ? found.value || found.visitors : 0;
  };

  if (loading) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 400, background: '#f0f2f5', borderRadius: 8, overflow: 'hidden' }}>
      <ComposableMap projection="geoMercator">
        <ZoomableGroup zoom={0.8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const value = getCountryValue(geo.properties.name);
                const opacity = value > 0 ? 0.3 + (value / 100) * 0.7 : 0.1;
                const fill = value > 0 ? '#7000ff' : '#d1d5db';
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    opacity={opacity}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#00f0ff', outline: 'none' },
                      pressed: { fill: '#00f0ff', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      <div style={{ padding: '12px 24px', background: '#ffffff', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span>🌍 访客分布：</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#d1d5db', borderRadius: 2 }}></div>
            <span>无数据</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#7000ff', opacity: 0.4, borderRadius: 2 }}></div>
            <span>少量</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#7000ff', opacity: 0.8, borderRadius: 2 }}></div>
            <span>较多</span>
          </div>
        </div>
      </div>
    </div>
  );
}
