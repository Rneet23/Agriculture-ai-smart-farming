# Agriculture AI - Smart Farming Platform

An intelligent agricultural management system powered by AI and real-time live data feeds. Get actionable insights for crop health, disease detection, yield prediction, and market analysis.

## Features

### 🌱 Live Data Integration
- **Real-Time Weather Data** - Open-Meteo API provides current temperature, humidity, rainfall, soil moisture, wind speed, and UV index
- **Live Commodity Prices** - Yahoo Finance integration for wheat, corn, soybeans, cotton, coffee, sugar and other agricultural commodities
- **Soil Health Monitoring** - Real-time NPK levels, pH, and organic matter analysis
- **Pest Risk Assessment** - AI-driven pest and disease risk prediction based on environmental conditions
- **Historical Trend Analysis** - 7-day moisture and yield history with forecasts

### 🤖 AI-Powered Features
- **Crop Disease Detection** - Upload crop images for instant disease identification using Gemini AI
- **Yield Prediction** - Get predictive yield estimates based on live environmental data
- **Smart Recommendations** - Personalized fertilizer, irrigation, and pest management advice
- **Environmental Analysis** - Real-time environmental factor assessment and recommendations

### 📊 Dashboard Analytics
- Live weather monitoring with historical trends
- Commodity market price tracking
- Soil health indicators
- Pest risk warnings
- Crop growth stage monitoring
- Irrigation and fertilizer recommendations
  
## Setup & Configuration

### Prerequisites
- Node.js 18+
- Gemini API Key (from [ai.google.dev](https://ai.google.dev/))

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Add your Gemini API Key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the Application

**Development mode:**
```bash
npm run dev
```

The app will start at `http://localhost:3000` with live data feeds automatically enabled.

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## API Endpoints

### GET /api/farm-data
Returns all real-time environmental and market data.
