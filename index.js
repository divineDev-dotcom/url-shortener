require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory database
const urlDatabase = {};
let count = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Route to handle shortening URLs
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validate URL format
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL is already shortened
  const existingShortUrl = Object.keys(urlDatabase).find(
    (shortUrl) => urlDatabase[shortUrl] === url
  );

  if (existingShortUrl) {
    return res.json({
      original_url: url,
      short_url: existingShortUrl
    });
  }

  // Generate a new short URL
  const shortUrl = count.toString();

  // Save URL mapping in the database
  urlDatabase[shortUrl] = url;
  count++;

  return res.json({
    original_url: url,
    short_url: shortUrl
  });
});

// Route to handle short URL redirection
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'short url not found' });
  }
});

// Helper function to validate URL format
function isValidUrl(url) {
  const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/;
  return pattern.test(url);
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
