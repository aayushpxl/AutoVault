require('dotenv').config();
const app = require('./index')

const PORT = process.env.PORT || 5000;


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


