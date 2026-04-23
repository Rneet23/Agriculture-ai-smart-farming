import React, { useState, useEffect } from 'react';
import {
  Sprout, Droplets, Thermometer, CloudRain, TrendingUp,
  Camera, Settings, HelpCircle, Search, Plus,
  Activity, Wind, Zap, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  analyzeCropImage, getEnhancedPredictions,
  type DiseaseAnalysis, type FarmingPredictions, type EnhancedPrediction
} from '../services/gemini';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface MarketPrice {
  name: string;
  price: string;
  changePercent: number;
  currency?: string;
}

interface SoilHealth {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: string;
  organicMatter: string;
  lastTested: string;
}

interface PestRisk {
  mites: string;
  aphids: string;
  powderyMildew: string;
  leafBlight: string;
  overallRisk: string;
}

interface HistoryPoint {
  date: string;
  moisture: number;
  yield: number;
  rainfall: number;
  temperature: number;
}

interface LiveDataState {
  currentTemp: number;
  humidity: number;
  soilMoisture: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  rainfallForecast: number;
  tempMax: number;
  tempMin: number;
  marketPrices: MarketPrice[];
  soilHealth: SoilHealth;
  pestRisk: PestRisk;
  airQuality: number;
  history: HistoryPoint[];
  forecastDays: number[];
  timestamp: string;
}

const EMPTY_LIVE_DATA: LiveDataState = {
  currentTemp: 0,
  humidity: 0,
  soilMoisture: 0,
  precipitation: 0,
  windSpeed: 0,
  uvIndex: 0,
  rainfallForecast: 0,
  tempMax: 0,
  tempMin: 0,
  marketPrices: [],
  soilHealth: {
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    pH: '--',
    organicMatter: '--',
    lastTested: '--',
  },
  pestRisk: {
    mites: '--',
    aphids: '--',
    powderyMildew: '--',
    leafBlight: '--',
    overallRisk: '--',
  },
  airQuality: 0,
  history: [],
  forecastDays: [],
  timestamp: new Date().toISOString(),
};

const NAV_ITEMS = [
  { id: 'overview', icon: <Activity size={18} />, label: 'Overview' },
  { id: 'disease',  icon: <Camera size={18} />,   label: 'Disease Detection' },
  { id: 'soil',     icon: <Droplets size={18} />, label: 'Soil & Irrigation' },
  { id: 'yield',    icon: <TrendingUp size={18} />, label: 'Yield Prediction' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysis | null>(null);
  const [predictions, setPredictions] = useState<FarmingPredictions | EnhancedPrediction | null>(null);
  const [savedCrops, setSavedCrops] = useState<any[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [liveData, setLiveData] = useState<LiveDataState>(EMPTY_LIVE_DATA);

  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    soilType: 'Loamy',
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    farmArea: 5,
    growthStage: 'Vegetative',
  });

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch('/api/farm-data');
        if (res.ok) {
          const data: LiveDataState = await res.json();
          setLiveData(data);
          setFormData(prev => ({
            ...prev,
            temperature: data.currentTemp || prev.temperature,
            humidity: data.humidity || prev.humidity,
            rainfall: data.rainfallForecast || prev.rainfall,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch live farm data:', err);
      } finally {
        setIsLiveLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 1_800_000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await analyzeCropImage(base64, file.type);
        setAnalysisResult(result);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image analysis failed:', err);
      setIsAnalyzing(false);
    }
  };

  const handlePredict = async () => {
    setIsAnalyzing(true);
    try {
      const result = await getEnhancedPredictions(formData);
      setPredictions(result);
      setSavedCrops(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        ...formData,
        ...result,
      }, ...prev]);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-bg-primary border-r border-border hidden lg:flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-md">
              <Sprout size={20} />
            </div>
            <div>
              <h1 className="font-display font-700 text-lg text-text-primary">AgriSmart</h1>
              <p className="text-xs text-text-muted">Smart Farming</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm',
                activeTab === item.id
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Live Status */}
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                'w-2.5 h-2.5 rounded-full animate-pulse-subtle',
                isLiveLoading ? 'bg-warning' : 'bg-success'
              )} />
              <span className="text-xs font-semibold text-text-primary">Live Feed</span>
            </div>
            <p className="text-xs text-text-muted">
              {isLiveLoading ? 'Connecting...' : 'Active'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search size={18} className="text-text-muted" />
              <input
                type="text"
                placeholder="Search farm data..."
                className="input bg-bg-secondary border-0 focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-text-muted hover:bg-bg-tertiary transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="p-2 rounded-lg text-text-muted hover:bg-bg-tertiary transition-colors">
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-semibold text-xs shadow-md">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 max-w-7xl">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-end justify-between">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="heading-lg">Farm Overview</h2>
                    <p className="text-text-muted mt-1">
                      {isLiveLoading ? 'Fetching live data...' : `Last updated ${new Date(liveData.timestamp).toLocaleTimeString()}`}
                    </p>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('yield')}
                    className="btn btn-primary"
                  >
                    <Plus size={18} />
                    <span>New Crop</span>
                  </motion.button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Temperature', value: isLiveLoading ? '--' : `${liveData.currentTemp}°C`, sub: `${liveData.tempMin}° – ${liveData.tempMax}°`, icon: <Thermometer />, color: 'text-warning' },
                    { label: 'Soil Moisture', value: isLiveLoading ? '--' : `${liveData.soilMoisture}%`, sub: `Wind ${liveData.windSpeed} m/s`, icon: <Droplets />, color: 'text-info' },
                    { label: 'Rainfall', value: isLiveLoading ? '--' : `${liveData.rainfallForecast.toFixed(1)} mm`, sub: 'Next 24h', icon: <CloudRain />, color: 'text-secondary' },
                    { label: 'Air Quality', value: isLiveLoading ? '--' : `${liveData.airQuality}`, sub: liveData.airQuality < 50 ? 'Good' : 'Moderate', icon: <Zap />, color: 'text-success' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="card-interactive p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="label">{stat.label}</span>
                        <div className={cn('p-2 rounded-lg bg-bg-tertiary', stat.color)}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="stat-value">{stat.value}</p>
                        <p className="caption">{stat.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts & Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Area Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 card p-6"
                  >
                    <h3 className="heading-sm mb-6">Moisture & Yield Trends</h3>
                    {liveData.history.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={liveData.history}>
                            <defs>
                              <linearGradient id="gMoisture" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#457b9d" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#457b9d" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                            <XAxis dataKey="date" stroke="#adb5bd" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#adb5bd" style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{
                                background: '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              }}
                            />
                            <Area type="monotone" dataKey="moisture" stroke="#457b9d" strokeWidth={2} fill="url(#gMoisture)" />
                            <Area type="monotone" dataKey="yield" stroke="#2d6a4f" strokeWidth={2} fill="url(#gYield)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <Activity size={32} className="text-text-muted mb-2 opacity-40" />
                        <p className="text-text-muted text-sm">{isLiveLoading ? 'Loading data...' : 'No data available'}</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Weather */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6"
                  >
                    <h3 className="heading-sm mb-5">Weather Details</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Temperature', value: isLiveLoading ? '--' : `${liveData.currentTemp}°C`, icon: <Thermometer size={16} /> },
                        { label: 'Humidity', value: isLiveLoading ? '--' : `${liveData.humidity}%`, icon: <Droplets size={16} /> },
                        { label: 'Wind Speed', value: isLiveLoading ? '--' : `${liveData.windSpeed} m/s`, icon: <Wind size={16} /> },
                        { label: 'UV Index', value: isLiveLoading ? '--' : `${liveData.uvIndex}`, icon: <Zap size={16} /> },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2 text-text-secondary">
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <span className="font-mono font-semibold text-text-primary">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Market + Soil + Pest */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Market */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card p-6"
                  >
                    <h3 className="heading-sm mb-5">Live Market Prices</h3>
                    <div className="space-y-2 overflow-y-auto max-h-48">
                      {isLiveLoading ? (
                        <div className="space-y-2">
                          {[1,2,3].map(i => <div key={i} className="skeleton h-8" />)}
                        </div>
                      ) : liveData.marketPrices.length > 0 ? (
                        liveData.marketPrices.map((asset, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm font-medium text-text-primary">{asset.name}</span>
                            <div className="text-right">
                              <p className="font-mono font-semibold text-text-primary">${asset.price}</p>
                              <p className={cn('text-xs font-medium', asset.changePercent >= 0 ? 'text-success' : 'text-danger')}>
                                {asset.changePercent >= 0 ? '↑' : '↓'} {Math.abs(asset.changePercent).toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-text-muted text-center py-4">No market data</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Soil Health */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                  >
                    <h3 className="heading-sm mb-5">Soil Health</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Nitrogen', value: isLiveLoading ? '--' : `${liveData.soilHealth.nitrogen} mg/kg` },
                        { label: 'Phosphorus', value: isLiveLoading ? '--' : `${liveData.soilHealth.phosphorus} mg/kg` },
                        { label: 'Potassium', value: isLiveLoading ? '--' : `${liveData.soilHealth.potassium} mg/kg` },
                        { label: 'pH', value: isLiveLoading ? '--' : liveData.soilHealth.pH },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">{item.label}</span>
                          <span className="font-mono font-semibold text-primary">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Pest Risk */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={cn(
                      'card p-6',
                      !isLiveLoading && liveData.pestRisk.overallRisk === 'High' && 'border-danger/30 bg-danger/3'
                    )}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="heading-sm">Pest Risk</h3>
                      {!isLiveLoading && liveData.pestRisk.overallRisk !== '--' && (
                        <span className={cn('badge', getRiskBadge(liveData.pestRisk.overallRisk))}>
                          {liveData.pestRisk.overallRisk}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Mites', value: isLiveLoading ? '--' : liveData.pestRisk.mites },
                        { label: 'Aphids', value: isLiveLoading ? '--' : liveData.pestRisk.aphids },
                        { label: 'Powdery Mildew', value: isLiveLoading ? '--' : liveData.pestRisk.powderyMildew },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">{item.label}</span>
                          <span className={cn('text-xs font-semibold', getRiskColor(item.value))}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Crop Records */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card overflow-hidden"
                >
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="heading-sm">Recent Crop Records</h3>
                    <span className="badge badge-neutral">{savedCrops.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-bg-tertiary border-b border-border">
                          {['Date', 'Crop', 'Moisture', 'Yield', 'Status'].map(h => (
                            <th key={h} className="px-6 py-3 text-left label">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedCrops.length > 0 ? (
                          savedCrops.slice(0, 5).map(crop => (
                            <tr key={crop.id} className="border-b border-border hover:bg-bg-tertiary transition-colors">
                              <td className="px-6 py-4 text-text-secondary">{crop.date}</td>
                              <td className="px-6 py-4 font-medium text-text-primary">{crop.cropType}</td>
                              <td className="px-6 py-4 font-mono text-info">{crop.soilMoisture}%</td>
                              <td className="px-6 py-4 font-mono text-primary">{crop.predictedYield}t</td>
                              <td className="px-6 py-4">
                                <span className={cn('badge', getRiskBadge(crop.moistureStatus))}>
                                  {crop.moistureStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                              No records yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── DISEASE DETECTION ─────────────────────────────────── */}
            {activeTab === 'disease' && (
              <motion.div
                key="disease"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="heading-lg">Plant Diagnostic</h2>
                  <p className="text-text-muted mt-1">Upload a photo of your crop for AI disease detection</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload Zone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border-2 border-dashed border-primary/30 p-8 flex flex-col items-center justify-center min-h-96 hover:border-primary/60 hover:bg-primary/2 transition-all cursor-pointer group relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <p className="heading-sm text-center mb-2">Drop image here or click</p>
                    <p className="text-text-muted text-sm">JPG, PNG — up to 10MB</p>

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg z-30">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm font-medium text-primary">Analyzing...</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Results */}
                  {analysisResult ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card p-6 space-y-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="heading-md">{analysisResult.disease}</h3>
                        <span className={cn('badge', analysisResult.disease === 'Healthy' ? 'badge-success' : 'badge-danger')}>
                          {Math.round(analysisResult.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-text-secondary">{analysisResult.description}</p>
                      <div className="border-t border-border pt-4 space-y-3">
                        <div>
                          <p className="label mb-1">Recommendations</p>
                          <p className="text-sm text-text-secondary whitespace-pre-line">{analysisResult.treatment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="empty-state card bg-bg-tertiary">
                      <AlertCircle size={32} className="text-text-muted mb-3 opacity-40" />
                      <p className="text-text-muted">Results will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── PREDICTIONS ──────────────────────────────────────── */}
            {(activeTab === 'soil' || activeTab === 'yield') && (
              <motion.div
                key="prediction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="heading-lg">{activeTab === 'soil' ? 'Soil & Irrigation' : 'Yield Prediction'}</h2>
                  <p className="text-text-muted mt-1">Enter farm data for AI-powered predictions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-4"
                  >
                    <h3 className="heading-sm">Farm Parameters</h3>
                    <FormField label="Crop Type" value={formData.cropType} onChange={v => setFormData({ ...formData, cropType: v })} />
                    <FormField label="Soil Type" value={formData.soilType} onChange={v => setFormData({ ...formData, soilType: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Temp °C" type="number" value={formData.temperature} onChange={v => setFormData({ ...formData, temperature: Number(v) })} />
                      <FormField label="Humidity %" type="number" value={formData.humidity} onChange={v => setFormData({ ...formData, humidity: Number(v) })} />
                    </div>
                    <FormField label="Rainfall mm" type="number" value={formData.rainfall} onChange={v => setFormData({ ...formData, rainfall: Number(v) })} />
                    <FormField label="Area (ha)" type="number" value={formData.farmArea} onChange={v => setFormData({ ...formData, farmArea: Number(v) })} />
                    <FormField label="Growth Stage" value={formData.growthStage} onChange={v => setFormData({ ...formData, growthStage: v })} />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePredict}
                      disabled={isAnalyzing}
                      className="btn btn-primary w-full mt-6"
                    >
                      {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrendingUp size={18} />
                      )}
                      Calculate Predictions
                    </motion.button>
                  </motion.div>

                  {/* Results */}
                  <div className="lg:col-span-2 space-y-4">
                    {predictions ? (
                      <>
                        {activeTab === 'soil' && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="heading-sm flex items-center gap-2">
                                <Droplets size={20} className="text-info" />
                                Soil & Irrigation
                              </h3>
                              <span className="badge badge-info">{predictions.moistureStatus}</span>
                            </div>
                            <p className="text-4xl font-display font-700 text-primary mb-1">
                              {predictions.soilMoisture}<span className="text-lg text-text-muted">%</span>
                            </p>
                            <p className="text-text-muted text-sm mb-4">Soil moisture estimate</p>
                            <div className="bg-bg-tertiary rounded-lg p-4 border border-border">
                              <p className="label mb-2">Recommendation</p>
                              <p className="text-sm text-text-secondary">{predictions.irrigationAdvice}</p>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'yield' && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="heading-sm flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Yield Forecast
                              </h3>
                              <span className="badge badge-success">On Track</span>
                            </div>
                            <p className="text-4xl font-display font-700 text-primary mb-1">
                              {predictions.predictedYield}<span className="text-lg text-text-muted"> t/ha</span>
                            </p>
                            <p className="text-text-muted text-sm mb-4">Expected yield per hectare</p>
                            <div className="bg-bg-tertiary rounded-lg p-4 border border-border">
                              <p className="label mb-2">Harvest Timeline</p>
                              <p className="text-sm text-text-secondary">{predictions.harvestTime}</p>
                            </div>
                          </motion.div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="card p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
                        >
                          <p className="label mb-3 flex items-center gap-2">
                            <Sprout size={14} /> Fertilizer Recommendation
                          </p>
                          <p className="text-sm text-text-secondary">{predictions.fertilizerAdvice}</p>
                        </motion.div>
                      </>
                    ) : (
                      <div className="empty-state card bg-bg-tertiary">
                        <TrendingUp size={32} className="text-text-muted mb-3 opacity-40" />
                        <p className="text-text-muted">Enter data and calculate to see predictions</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────

function FormField({
  label, value, onChange, type = 'text',
}: {
  label: string; value: any; onChange: (v: any) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function getRiskBadge(risk: string): string {
  if (risk === 'High') return 'badge-danger';
  if (risk === 'Moderate') return 'badge-warning';
  if (risk === 'Low') return 'badge-success';
  return 'badge-neutral';
}

function getRiskColor(risk: string): string {
  if (risk === 'High') return 'text-danger font-semibold';
  if (risk === 'Moderate') return 'text-warning font-semibold';
  if (risk === 'Low') return 'text-success font-semibold';
  return 'text-text-muted';
}
