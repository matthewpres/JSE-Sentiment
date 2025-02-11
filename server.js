// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// 1) Middleware to parse JSON bodies
app.use(express.json());

// 2) Serve the "public" folder statically
app.use(express.static("public"));

// 3) Simple in-file store: predictions.json
//    Format: { "TICKER": [price1, price2, ...], ... }
const PREDICTIONS_FILE = path.join(__dirname, "predictions.json");

// Helper: read the predictions.json file (or return an empty object if missing)
function readPredictions() {
  try {
    return JSON.parse(fs.readFileSync(PREDICTIONS_FILE, "utf8"));
  } catch (err) {
    return {};
  }
}

// Helper: write out the predictions.json file
function writePredictions(data) {
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(data, null, 2));
}

// 4) GET /api/predictions – return all predictions
app.get("/api/predictions", (req, res) => {
  const predictions = readPredictions();
  res.json(predictions);
});

// 5) POST /api/predictions – add a new prediction
app.post("/api/predictions", (req, res) => {
  const { ticker, price } = req.body;
  if (!ticker || !price || isNaN(price)) {
    return res.status(400).json({ error: "Invalid ticker or price" });
  }

  const tickerUpper = ticker.toUpperCase();

  // read file -> update -> write file
  const predictions = readPredictions();
  if (!predictions[tickerUpper]) {
    predictions[tickerUpper] = [];
  }
  predictions[tickerUpper].push(Number(price));
  writePredictions(predictions);

  // Return updated predictions
  res.json(predictions);
});

// 6) Start listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
