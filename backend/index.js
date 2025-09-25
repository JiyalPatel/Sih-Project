const express = require("express");
const mongoose = require("mongoose");
const { PORT, DB_URL } = require("./constants");
const allRoutes = require("./routes");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", allRoutes);

mongoose
    .connect(DB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));

app.listen(PORT || 8080, () => {
    console.log(`Server is running on http://localhost:${PORT || 8080}`);
});
