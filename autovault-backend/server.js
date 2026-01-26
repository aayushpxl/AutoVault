require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./index');

const PORT = process.env.PORT || 5000;

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, () => {
  console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
});

