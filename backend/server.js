require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- 1. AJOUTEZ CETTE PARTIE POUR PROMETHEUS ---
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });
// -----------------------------------------------

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:30001", "http://localhost:5173"], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Routes existantes
app.get("/", (req, res) => {
  res.send("API Gestion de Projets Collaboratifs 🚀");
});

// --- 2. AJOUTEZ LA ROUTE /METRICS ICI ---
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});
// ----------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/ai", aiRoutes); 

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(PORT, () =>
      console.log(`🚀 Serveur lancé sur le port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ Erreur MongoDB :", err));