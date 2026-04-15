const express = require('express');
const cors = require('cors');
const incidentsRouter = require('./routes/incidents');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/incidents', incidentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shipping Incidents API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
