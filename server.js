const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Load data
let data = [];
try {
  const dataPath = path.join(__dirname, 'json', 'vietnam_admin_units.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  data = JSON.parse(rawData);
  console.log(`Loaded ${data.length} provinces/cities`);
} catch (error) {
  console.error('Error loading data:', error);
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>DVHC Vietnam Data API</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .method { color: #007bff; font-weight: bold; }
          .nav-links { margin: 20px 0; }
          .nav-links a {
            display: inline-block;
            margin-right: 15px;
            padding: 10px 20px;
            background: #ffd9e8;
            color: #333;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .nav-links a:hover { background: #ffb3d1; }
        </style>
      </head>
      <body>
        <h1>🇻🇳 DVHC Vietnam Data API</h1>
        <p>API để truy cập dữ liệu Đơn vị Hành chính Việt Nam</p>

        <div class="nav-links">
          <a href="/lookup.html">🔍 Tra cứu DVHC</a>
          <a href="/demo.html">📊 Demo API</a>
          <a href="/json/data.json">📄 Dữ liệu JSON</a>
        </div>

        <h2>Available Endpoints:</h2>

        <div class="endpoint">
          <span class="method">GET</span> <code>/api/provinces</code> - Lấy danh sách tất cả tỉnh/thành phố
        </div>

        <div class="endpoint">
          <span class="method">GET</span> <code>/api/provinces/:code</code> - Lấy thông tin tỉnh/thành phố theo mã
        </div>

        <div class="endpoint">
          <span class="method">GET</span> <code>/api/provinces/:code/wards</code> - Lấy danh sách phường/xã của tỉnh/thành phố
        </div>

        <div class="endpoint">
          <span class="method">GET</span> <code>/api/wards</code> - Lấy danh sách tất cả phường/xã
        </div>

        <div class="endpoint">
          <span class="method">GET</span> <code>/api/search?q=keyword</code> - Tìm kiếm tỉnh/thành phố theo tên
        </div>

        <div class="endpoint">
          <span class="method">GET</span> <code>/json/data.json</code> - Tải file JSON gốc
        </div>

        <h3>Examples:</h3>
        <ul>
          <li><a href="/api/provinces">Danh sách tỉnh/thành phố</a></li>
          <li><a href="/api/provinces/01">Thông tin Hà Nội (mã 01)</a></li>
          <li><a href="/api/provinces/01/wards">Danh sách phường/xã Hà Nội</a></li>
          <li><a href="/api/search?q=hà nội">Tìm kiếm "hà nội"</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Get all provinces
app.get('/api/provinces', (req, res) => {
  const provinces = data.map(province => ({
    province_code: province.province_code,
    name: province.name,
    short_name: province.short_name,
    place_type: province.place_type,
    area_km2: province.area_km2,
    population: province.population,
    ward_count: province.wards ? province.wards.length : 0
  }));
  res.json(provinces);
});

// Get province by code
app.get('/api/provinces/:code', (req, res) => {
  const province = data.find(p => p.province_code === req.params.code);
  if (!province) {
    return res.status(404).json({ error: 'Province not found' });
  }
  res.json(province);
});

// Get wards of a province
app.get('/api/provinces/:code/wards', (req, res) => {
  const province = data.find(p => p.province_code === req.params.code);
  if (!province) {
    return res.status(404).json({ error: 'Province not found' });
  }
  res.json(province.wards || []);
});

// Get all wards
app.get('/api/wards', (req, res) => {
  const allWards = [];
  data.forEach(province => {
    if (province.wards) {
      allWards.push(...province.wards);
    }
  });
  res.json(allWards);
});

// Search provinces
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const results = data.filter(province => 
    province.name.toLowerCase().includes(query.toLowerCase()) ||
    province.short_name.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json(results);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Data loaded: ${data.length} provinces/cities`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
});
