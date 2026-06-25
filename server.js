const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DATA_LOADER_PATH = path.join(__dirname, 'data-loader.js');

// Endpoint to save candidate data
app.post('/api/save-candidates', (req, res) => {
  try {
    const { candidatesByRole, rolesData, funnelSummaryData, scorecardLibrary } = req.body;

    // Create the data-loader.js content
    const content = `// ⚠️ CONTAINS SENSITIVE DATA - DO NOT COMMIT TO GIT
// This file loads candidate assessment data. Keep it in .gitignore and fill with your real data.
// See UPLOAD.md and DATA_FIELD_MAPPING.md for instructions on how to populate this file.
// Last updated: ${new Date().toISOString()}

window.TALENT_DATA = ${JSON.stringify({
      rolesData,
      candidatesByRole,
      funnelSummaryData,
      scorecardLibrary
    }, null, 2)};`;

    fs.writeFileSync(DATA_LOADER_PATH, content, 'utf8');
    res.json({ success: true, message: 'Data saved successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to get current data
app.get('/api/get-data', (req, res) => {
  try {
    if (fs.existsSync(DATA_LOADER_PATH)) {
      res.json({ success: true, hasData: true });
    } else {
      res.json({ success: true, hasData: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Talent Dashboard Server Running`);
  console.log(`\n📍 Open in browser: http://localhost:${PORT}`);
  console.log(`\n✎ Dashboard is now editable with auto-save to files\n`);
});
