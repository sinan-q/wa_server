const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3011; // Choose a suitable port number

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Array to store posted data
const postedData = [];

// Endpoint to handle the POST request
app.post('/your-endpoint', (req, res) => {
  const receivedData = req.body;
  postedData.push(receivedData); // Store the data
  
  console.log('Received data:', receivedData);
  
  res.status(200).send('POST request received successfully');
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint to send the posted data to the web page
app.get('/your-endpoint', (req, res) => {
  res.json(postedData);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});