import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock API for Crop Analysis (as requested in Feature 7)
  app.post("/api/analyze-crop", (req, res) => {
    const { crop_type, soil_type, temperature, humidity, rainfall, farm_area } = req.body;
    
    // In a real app, this would call the AI engine or a database
    // Here we return a mock response that matches the requested format
    res.json({
      disease: "Leaf Blight",
      pesticide: "Mancozeb",
      insecticide: "Imidacloprid",
      fertilizer: "NPK 20:10:10",
      soil_moisture: "42%",
      irrigation: "Irrigate every 2 days",
      yield_prediction: "3.8 tons/hectare"
    });
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
