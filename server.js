const express = require("express");
const path = require("path");

const app = express();

// Define the path to the Angular build folder
const angularDistPath = path.join(__dirname, "dist/toolforge-ng/browser");

// Serve static files from the Angular dist folder
app.use(express.static(angularDistPath));

// Handle Angular routing by serving index.html for any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});