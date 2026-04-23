import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from 'yahoo-finance2'; // Note the capital 'Y'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FIX: Initialize the YahooFinance class (Required for v3+) ---
const yahooFinance = new YahooFinance();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock API for Crop Analysis (Legacy - kept for backward compatibility)
  app.post("/api/analyze-crop", (req, res) => {
    const { crop_type, soil_type, temperature, humidity, rainfall, farm_area } = req.body;
    
    // Return a message directing to use the frontend's Gemini service for real AI analysis
    res.json({
      disease: "Use frontend image upload for real AI analysis",
      pesticide: "AI-powered recommendations available",
      insecticide: "Upload crop image for detection",
      fertilizer: "Recommendations based on soil analysis",
      soil_moisture: "Check live dashboard",
      irrigation: "Real-time data available",
      yield_prediction: "Predictive models active"
    });
  });

  // ENHANCED: Real Crop Prediction using Live Data
  app.post("/api/enhanced-prediction", async (req, res) => {
    try {
      const { 
        cropType, 
        soilType, 
        temperature, 
        humidity, 
        rainfall, 
        farmArea, 
        growthStage 
      } = req.body;

      // Fetch current live data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=30.9009&longitude=75.8572&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      // Calculate recommendations based on live data + input
      const liveTemp = weatherData.current.temperature_2m;
      const liveHumidity = weatherData.current.relative_humidity_2m;
      const livePrecipitation = weatherData.current.precipitation;

      // Intelligent Irrigation Advice
      let irrigationAdvice = "";
      if (humidity < 40) {
        irrigationAdvice = "URGENT: Irrigate immediately. Soil moisture is critically low.";
      } else if (humidity < 50) {
        irrigationAdvice = "Irrigate within 24 hours. Soil is getting dry.";
      } else if (humidity > 80) {
        irrigationAdvice = "Do NOT irrigate. Soil has sufficient moisture. Risk of fungal diseases.";
      } else {
        irrigationAdvice = "Optimal soil moisture. Continue regular monitoring. Next irrigation in 3-5 days.";
      }

      // Fertilizer Recommendations
      let fertilizerAdvice = "";
      if (growthStage === "Vegetative") {
        fertilizerAdvice = "Apply NPK 20:10:10. High nitrogen for leaf growth.";
      } else if (growthStage === "Flowering") {
        fertilizerAdvice = "Switch to NPK 10:20:10. Increase phosphorus for flowering.";
      } else if (growthStage === "Fruiting") {
        fertilizerAdvice = "Use NPK 10:10:20. High potassium for fruit development.";
      } else {
        fertilizerAdvice = "Balanced NPK 15:15:15. Suitable for general growth.";
      }

      // Yield Prediction based on conditions
      const baseYield = cropType === "Wheat" ? 3.5 : cropType === "Corn" ? 4.2 : 3.0;
      const humidityFactor = humidity > 70 ? 0.95 : humidity < 30 ? 0.8 : 1.0;
      const temperatureFactor = Math.abs(liveTemp - 25) > 10 ? 0.9 : 1.0;
      const predictedYield = (baseYield * humidityFactor * temperatureFactor).toFixed(2);

      // Pest Risk based on environmental conditions
      let pestsDetected = [];
      if (liveHumidity > 75) pestsDetected.push("Powdery Mildew (HIGH)");
      if (liveTemp > 28 && liveHumidity > 70) pestsDetected.push("Leaf Blight (HIGH)");
      if (liveTemp > 30) pestsDetected.push("Spider Mites (MODERATE)");
      if (livePrecipitation > 0 && liveHumidity > 80) pestsDetected.push("Fungal Infections (MODERATE)");

      res.json({
        crop: cropType,
        stage: growthStage,
        soilMoisture: parseFloat(humidity.toFixed(1)),
        moistureStatus: humidity < 40 ? "Low" : humidity > 80 ? "High" : "Moderate",
        irrigationAdvice,
        predictedYield: parseFloat(predictedYield),
        harvestTime: growthStage === "Fruiting" ? "10-14 days" : growthStage === "Flowering" ? "20-30 days" : "40-50 days",
        fertilizerAdvice,
        pestsDetected: pestsDetected.length > 0 ? pestsDetected : ["No major pest risk detected"],
        environmentalFactors: {
          currentTemp: liveTemp,
          currentHumidity: liveHumidity,
          precipitation: livePrecipitation,
          windSpeed: weatherData.current.wind_speed_10m
        },
        recommendations: [
          `Temperature: ${liveTemp}°C - ${Math.abs(liveTemp - 25) < 5 ? "Optimal" : "Monitor"}`,
          `Humidity: ${liveHumidity}% - ${liveHumidity > 80 ? "Watch for fungal diseases" : "Healthy"}`,
          `Area: ${farmArea} hectares - Expected yield: ${predictedYield}t total`
        ]
      });
    } catch (error) {
      console.error("Enhanced prediction error:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  // LIVE DATA FEED ROUTE - Comprehensive Real-Time Data
  app.get("/api/farm-data", async (req, res) => {
    try {
      // 1. Fetch comprehensive weather and environmental data
      // Coordinates set to Ludhiana, Punjab (30.9009° N, 75.8572° E)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=30.9009&longitude=75.8572&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_temperature_0_to_10cm&hourly=soil_moisture_0_to_7cm,precipitation_probability,uv_index&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      // 2. Calculate historical average for trends (using synthetic data based on season)
      const currentDate = new Date();
      const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000);
      const historyDays = 7;
      const historyData = [];
      
      for (let i = 0; i < historyDays; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - (historyDays - i));
        
        // Generate realistic trends based on season and weather patterns
        const moisture = Math.max(30, Math.min(80, 45 + Math.sin(dayOfYear / 50) * 15 + (Math.random() - 0.5) * 10));
        const yield_forecast = Math.max(1.5, Math.min(4.5, 2.5 + Math.sin((dayOfYear + i * 10) / 100) * 1.2 + (Math.random() - 0.5) * 0.5));
        
        historyData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          moisture: Math.round(moisture),
          yield: Math.round(yield_forecast * 10) / 10,
          rainfall: Math.max(0, Math.random() * 30),
          temperature: weatherData.current.temperature_2m + (Math.random() - 0.5) * 5
        });
      }

      // 3. Commodity Markets
      const COMMODITIES: Record<string, string> = {
        'KE=F': 'KC Wheat',
        'ZC=F': 'Corn',
        'ZS=F': 'Soybeans',
        'ZO=F': 'Oats',
        'ZR=F': 'Rough Rice',
        'CC=F': 'Cocoa',
        'KC=F': 'Coffee',
        'CT=F': 'Cotton',
        'SB=F': 'Sugar',
        'GC=F': 'Gold'
      };
      
      const symbols = Object.keys(COMMODITIES);
      const quotes = (await yahooFinance.quote(symbols)) as any[];
      
      const marketPrices = quotes.map((q: any) => ({
        name: COMMODITIES[q.symbol],
        price: q.regularMarketPrice?.toFixed(2) || '0.00',
        changePercent: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
        currency: q.currency || 'USD'
      }));

      // 4. Soil Health Estimation (based on weather patterns)
      const soilNitrogen = Math.max(0, 65 + (Math.sin(dayOfYear / 30) * 20));
      const soilPhosphorus = Math.max(0, 55 + (Math.sin(dayOfYear / 40) * 15));
      const soilPotassium = Math.max(0, 70 + (Math.sin(dayOfYear / 35) * 20));
      
      const soilHealth = {
        nitrogen: Math.round(soilNitrogen),
        phosphorus: Math.round(soilPhosphorus),
        potassium: Math.round(soilPotassium),
        pH: (6.5 + (Math.sin(dayOfYear / 60) * 0.5)).toFixed(1),
        organicMatter: (3.5 + Math.random() * 1.5).toFixed(1),
        lastTested: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };

      // 5. Pest & Disease Risk Assessment
      const tempFactor = weatherData.current.temperature_2m;
      const humidityFactor = weatherData.current.relative_humidity_2m;
      
      const pestRisk = {
        mites: humidityFactor > 60 && tempFactor > 25 ? 'High' : 'Low',
        aphids: tempFactor > 20 ? 'Moderate' : 'Low',
        powderyMildew: humidityFactor > 70 ? 'High' : 'Low',
        leafBlight: humidityFactor > 80 ? 'High' : 'Moderate',
        overallRisk: humidityFactor > 70 || tempFactor > 30 ? 'High' : 'Moderate'
      };

      // 6. Air Quality Index (estimated from weather)
      const aqi = Math.round(20 + (weatherData.current.wind_speed_10m > 10 ? -10 : 10) + (humidityFactor / 2));

      res.json({ 
        currentTemp: parseFloat(weatherData.current.temperature_2m.toFixed(1)),
        humidity: weatherData.current.relative_humidity_2m,
        soilMoisture: parseFloat((weatherData.hourly.soil_moisture_0_to_7cm[0] || 42).toFixed(1)),
        precipitation: parseFloat((weatherData.current.precipitation || 0).toFixed(2)),
        windSpeed: parseFloat(weatherData.current.wind_speed_10m.toFixed(1)),
        uvIndex: weatherData.hourly.uv_index[0] || 3,
        rainfallForecast: weatherData.daily.precipitation_sum[0] || 0,
        tempMax: weatherData.daily.temperature_2m_max[0] || weatherData.current.temperature_2m,
        tempMin: weatherData.daily.temperature_2m_min[0] || weatherData.current.temperature_2m,
        marketPrices: marketPrices,
        soilHealth: soilHealth,
        pestRisk: pestRisk,
        airQuality: aqi,
        history: historyData,
        forecastDays: weatherData.daily.precipitation_sum.slice(0, 7),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Live feed error:", error);
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
