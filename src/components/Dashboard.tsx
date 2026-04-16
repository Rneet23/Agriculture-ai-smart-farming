import React, { useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  TrendingUp, 
  AlertTriangle, 
  Camera, 
  LayoutDashboard,
  Settings,
  HelpCircle,
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeCropImage, getFarmingPredictions, type DiseaseAnalysis, type FarmingPredictions } from '../services/gemini';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOCK_HISTORY = [
  { name: 'Mon', moisture: 45, yield: 2.1 },
  { name: 'Tue', moisture: 42, yield: 2.3 },
  { name: 'Wed', moisture: 38, yield: 2.5 },
  { name: 'Thu', moisture: 55, yield: 2.8 },
  { name: 'Fri', moisture: 52, yield: 3.0 },
  { name: 'Sat', moisture: 48, yield: 3.2 },
  { name: 'Sun', moisture: 44, yield: 3.5 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysis | null>(null);
  const [predictions, setPredictions] = useState<FarmingPredictions | null>(null);
  const [savedCrops, setSavedCrops] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    soilType: 'Loamy',
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    farmArea: 5,
    growthStage: 'Vegetative'
  });

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
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const handlePredict = async () => {
    setIsAnalyzing(true);
    try {
      const result = await getFarmingPredictions(formData);
      setPredictions(result);
      
      // Save the prediction to the history
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        ...formData,
        ...result
      };
      setSavedCrops(prev => [newRecord, ...prev]);
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Prediction failed:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sprout size={24} />
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-primary uppercase">AgriSmart AI</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={<Camera size={20} />} 
            label="Disease Detection" 
            active={activeTab === 'disease'} 
            onClick={() => setActiveTab('disease')} 
          />
          <NavItem 
            icon={<Droplets size={20} />} 
            label="Soil & Irrigation" 
            active={activeTab === 'soil'} 
            onClick={() => setActiveTab('soil')} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Yield Prediction" 
            active={activeTab === 'yield'} 
            onClick={() => setActiveTab('yield')} 
          />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-primary-light rounded-xl p-4">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Pro Plan</p>
            <p className="text-sm text-text-main font-semibold mb-3">Get advanced weather insights</p>
            <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-bg px-4 py-2 rounded-lg w-96 border border-border">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search farm data..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-text-muted hover:text-primary transition-colors">
              <HelpCircle size={22} />
            </button>
            <button className="p-2 text-text-muted hover:text-primary transition-colors">
              <Settings size={22} />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary border border-border shadow-sm flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-text-main">Farm Overview</h2>
                    <p className="text-text-muted text-sm mt-1">Welcome back, here's what's happening on your farm today.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('yield')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-sm"
                  >
                    <Plus size={18} />
                    <span className="text-sm">Add New Crop</span>
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    icon={<Thermometer className="text-accent" />} 
                    label="Avg Temperature" 
                    value="28°C" 
                    trend="+2.1° from yesterday"
                    color="orange"
                  />
                  <StatCard 
                    icon={<Droplets className="text-blue-500" />} 
                    label="Soil Moisture" 
                    value="42%" 
                    trend="-5% from yesterday"
                    color="blue"
                  />
                  <StatCard 
                    icon={<CloudRain className="text-indigo-500" />} 
                    label="Expected Rainfall" 
                    value="12mm" 
                    trend="Next 24 hours"
                    color="indigo"
                  />
                  <StatCard 
                    icon={<TrendingUp className="text-primary" />} 
                    label="Predicted Yield" 
                    value="3.8t" 
                    trend="+0.4t vs last season"
                    color="emerald"
                  />
                </div>

                {/* Weather & News Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-border card-shadow">
                    <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CloudRain className="text-blue-500" size={16} />
                      Local Weather
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Thermometer size={18} className="text-accent" />
                          <span className="text-xs font-semibold text-text-main">Temperature</span>
                        </div>
                        <span className="font-bold text-sm">28°C</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Droplets size={18} className="text-blue-500" />
                          <span className="text-xs font-semibold text-text-main">Humidity</span>
                        </div>
                        <span className="font-bold text-sm">65%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <CloudRain size={18} className="text-indigo-500" />
                          <span className="text-xs font-semibold text-text-main">Rain Chance</span>
                        </div>
                        <span className="font-bold text-sm">15%</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border card-shadow">
                    <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4">Farming Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-border bg-bg rounded-lg">
                        <p className="text-[10px] font-bold text-primary uppercase mb-1">Market Price</p>
                        <p className="font-bold text-text-main">Wheat: $240/ton</p>
                        <p className="text-[11px] text-primary font-semibold mt-1">↑ 2.4% this week</p>
                      </div>
                      <div className="p-4 border border-border bg-bg rounded-lg">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Soil Health</p>
                        <p className="font-bold text-text-main">Nitrogen: Optimal</p>
                        <p className="text-[11px] text-blue-600 font-semibold mt-1">Last tested 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-border card-shadow">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider">Moisture & Yield Trends</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-[11px] font-bold text-text-muted uppercase">Yield</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-[11px] font-bold text-text-muted uppercase">Moisture</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_HISTORY}>
                            <defs>
                              <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.05}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.05}/>
                                <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#7f8c8d'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#7f8c8d'}} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            />
                            <Area type="monotone" dataKey="moisture" stroke="#3B82F6" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={2} />
                            <Area type="monotone" dataKey="yield" stroke="#2d5a27" fillOpacity={1} fill="url(#colorYield)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Records Table */}
                    <div className="bg-white rounded-xl border border-border card-shadow overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider">Recent Crop Records</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-bg">
                              <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Crop</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Moisture</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Yield (t)</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {savedCrops.length > 0 ? (
                              savedCrops.map((crop) => (
                                <tr key={crop.id} className="hover:bg-bg/50 transition-colors">
                                  <td className="px-6 py-4 text-xs font-medium text-text-muted">{crop.date}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-text-main">{crop.cropType}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-blue-600">{crop.soilMoisture}%</td>
                                  <td className="px-6 py-4 text-xs font-bold text-primary">{crop.predictedYield}t</td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                                      crop.moistureStatus === "Low" ? "bg-red-100 text-red-600" : 
                                      crop.moistureStatus === "Moderate" ? "bg-blue-100 text-blue-600" : 
                                      "bg-emerald-100 text-emerald-600"
                                    )}>
                                      {crop.moistureStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-xs italic">
                                  No records found. Add a new crop to see data here.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-border card-shadow">
                      <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <ActionButton 
                          onClick={() => setActiveTab('disease')}
                          icon={<Camera className="text-primary" />}
                          title="Analyze Crop"
                          desc="Upload photo to detect disease"
                        />
                        <ActionButton 
                          onClick={() => setActiveTab('soil')}
                          icon={<Droplets className="text-blue-600" />}
                          title="Check Soil"
                          desc="Get irrigation advice"
                        />
                        <ActionButton 
                          onClick={() => setActiveTab('yield')}
                          icon={<TrendingUp className="text-indigo-600" />}
                          title="Predict Yield"
                          desc="Estimate harvest output"
                        />
                      </div>
                    </div>

                    <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Smart Tip</h3>
                        <p className="text-primary-light text-sm leading-relaxed opacity-90">
                          Based on current humidity levels, we recommend checking your wheat crop for signs of powdery mildew in the lower leaves.
                        </p>
                        <button className="mt-4 text-xs font-bold flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-wider">
                          Learn More <ArrowRight size={14} />
                        </button>
                      </div>
                      <Sprout size={100} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'disease' && (
              <motion.div 
                key="disease"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-text-main">Plant Diagnostic</h2>
                  <p className="text-text-muted text-sm mt-1">Upload a clear photo of the affected leaf or plant part.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-bg p-8 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center min-h-[400px] relative group hover:border-primary transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary mb-4 border border-border shadow-sm group-hover:scale-105 transition-transform">
                      <Camera size={32} />
                    </div>
                    <p className="text-base font-bold text-text-main">Click or drag photo here</p>
                    <p className="text-text-muted text-xs mt-1">Supports JPG, PNG up to 10MB</p>
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-xl">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold text-primary text-sm">AI is analyzing your crop...</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {analysisResult ? (
                      <div className="bg-white p-6 rounded-xl border border-border card-shadow space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-text-main">{analysisResult.disease}</h3>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            analysisResult.disease === "Healthy" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {Math.round(analysisResult.confidence * 100)}% Confidence
                          </div>
                        </div>
                        
                        <p className="text-sm text-text-muted leading-relaxed">{analysisResult.description}</p>

                        <div className="grid grid-cols-1 gap-1 pt-2">
                          <DataRow label="Pesticide" value={analysisResult.pesticide} />
                          <DataRow label="Insecticide" value={analysisResult.insecticide} />
                          <DataRow label="Fertilizer" value={analysisResult.fertilizer} />
                        </div>

                        <div className="pt-6 border-t border-border">
                          <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-primary" />
                            Treatment Plan
                          </h4>
                          <p className="text-xs text-text-main whitespace-pre-line leading-relaxed bg-bg p-4 rounded-lg border border-border">
                            {analysisResult.treatment}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-xl border border-border card-shadow flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                        <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center text-text-muted mb-4 border border-border">
                          <LayoutDashboard size={24} />
                        </div>
                        <p className="font-bold text-text-muted text-sm uppercase tracking-wider">Analysis results will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'soil' || activeTab === 'yield') && (
              <motion.div 
                key="prediction"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-text-main">
                    {activeTab === 'soil' ? 'Soil & Irrigation' : 'Yield Prediction'}
                  </h2>
                  <p className="text-text-muted text-sm mt-1">Enter your farm data to get AI-powered insights.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-xl border border-border card-shadow space-y-6">
                    <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4">Farm Data</h3>
                    <div className="space-y-4">
                      <InputGroup label="Crop Type" value={formData.cropType} onChange={(v) => setFormData({...formData, cropType: v})} />
                      <InputGroup label="Soil Type" value={formData.soilType} onChange={(v) => setFormData({...formData, soilType: v})} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Temp (°C)" type="number" value={formData.temperature} onChange={(v) => setFormData({...formData, temperature: Number(v)})} />
                        <InputGroup label="Humidity (%)" type="number" value={formData.humidity} onChange={(v) => setFormData({...formData, humidity: Number(v)})} />
                      </div>
                      <InputGroup label="Rainfall (mm)" type="number" value={formData.rainfall} onChange={(v) => setFormData({...formData, rainfall: Number(v)})} />
                      <InputGroup label="Farm Area (ha)" type="number" value={formData.farmArea} onChange={(v) => setFormData({...formData, farmArea: Number(v)})} />
                      <InputGroup label="Growth Stage" value={formData.growthStage} onChange={(v) => setFormData({...formData, growthStage: v})} />
                    </div>
                    <button 
                      onClick={handlePredict}
                      disabled={isAnalyzing}
                      className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <TrendingUp size={18} />}
                      Calculate Predictions
                    </button>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {predictions ? (
                      <div className="grid grid-cols-1 gap-6">
                        {activeTab === 'soil' && (
                          <div className="bg-white p-6 rounded-xl border border-border card-shadow space-y-6">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-blue-600">
                                <Droplets size={20} />
                                <h3 className="text-[13px] font-bold uppercase tracking-wider">Soil & Irrigation</h3>
                              </div>
                              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                                {predictions.moistureStatus}
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[32px] font-light text-text-main">{predictions.soilMoisture}%</span>
                              <span className="text-xs font-bold text-text-muted uppercase">Moisture</span>
                            </div>
                            <div className="p-4 bg-bg rounded-lg border border-border">
                              <p className="text-[10px] font-bold text-primary uppercase mb-1">Recommendation</p>
                              <p className="text-xs text-text-main leading-relaxed font-semibold">{predictions.irrigationAdvice}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'yield' && (
                          <div className="bg-white p-6 rounded-xl border border-border card-shadow space-y-6">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-primary">
                                <TrendingUp size={20} />
                                <h3 className="text-[13px] font-bold uppercase tracking-wider">Yield & Harvest</h3>
                              </div>
                              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                On Track
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[32px] font-light text-text-main">{predictions.predictedYield}t</span>
                              <span className="text-xs font-bold text-text-muted uppercase">Per Hectare</span>
                            </div>
                            <div className="p-4 bg-bg rounded-lg border border-border">
                              <p className="text-[10px] font-bold text-primary uppercase mb-1">Estimated Harvest</p>
                              <p className="text-xs text-text-main leading-relaxed font-semibold">{predictions.harvestTime}</p>
                            </div>
                          </div>
                        )}

                        <div className="bg-primary text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <Sprout size={20} className="text-primary-light" />
                            <h3 className="text-[13px] font-bold uppercase tracking-wider">Fertilizer Recommendation</h3>
                          </div>
                          <p className="text-sm text-primary-light leading-relaxed font-medium">
                            {predictions.fertilizerAdvice}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-xl border border-border card-shadow flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                        <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center text-text-muted mb-4 border border-border">
                          <TrendingUp size={24} />
                        </div>
                        <p className="font-bold text-text-muted text-sm uppercase tracking-wider">Enter data and click calculate to see results</p>
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

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all uppercase tracking-wider",
        active 
          ? "bg-primary-light text-primary border-b-2 border-primary" 
          : "text-text-muted hover:bg-bg hover:text-text-main"
      )}
    >
      {icon}
      <span className="text-[12px]">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border card-shadow hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h4 className="text-[32px] font-light text-text-main leading-none">{value}</h4>
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wide">{trend}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-bg transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center group-hover:bg-white transition-colors border border-border">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-text-main">{title}</p>
        <p className="text-[11px] text-text-muted font-medium">{desc}</p>
      </div>
      <ArrowRight size={16} className="ml-auto text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </button>
  );
}

function DataRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold text-text-main">{value}</span>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: any) => void, type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
      />
    </div>
  );
}
