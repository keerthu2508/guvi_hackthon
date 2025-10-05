
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'patients.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'prototype')));

// Ensure data directory and file
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));

function readData(){ return JSON.parse(fs.readFileSync(DATA_FILE)); }
function writeData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

app.get('/api/patients', (req, res) => {
  const data = readData();
  res.json(data);
});

app.get('/api/patients/:id', (req, res) => {
  const data = readData();
  const p = data.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({error:'Not found'});
  res.json(p);
});

app.post('/api/patients', (req, res) => {
  const data = readData();
  const id = Date.now();
  const p = { id, ...req.body, vitals: req.body.vitals || [], meds: req.body.meds || [], lastSync: new Date().toISOString().slice(0,10) };
  data.push(p);
  writeData(data);
  res.json(p);
});

app.post('/api/patients/:id/vitals', (req, res) => {
  const data = readData();
  const p = data.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({error:'Not found'});
  p.vitals = p.vitals || [];
  p.vitals.push(req.body);
  p.lastSync = new Date().toISOString().slice(0,10);
  writeData(data);
  res.json(p);
});

app.post('/api/patients/:id/meds', (req, res) => {
  const data = readData();
  const p = data.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({error:'Not found'});
  p.meds = p.meds || [];
  p.meds.push(req.body);
  writeData(data);
  res.json(p);
});

app.get('/api/health', (req, res) => res.json({status:'ok'}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started on port', PORT));
