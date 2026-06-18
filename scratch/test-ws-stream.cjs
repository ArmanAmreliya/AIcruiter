const fs = require('fs');
const WebSocket = require('ws');

const envPath = "c:\\Projects\\AIcruiter\\AIcruiter\\.env";
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let apiKey = '';
for (const line of lines) {
  if (line.trim().startsWith('NEXT_DEEPGRAM_API_KEY=')) {
    apiKey = line.split('=')[1].trim().replace(/"/g, '');
  }
}

console.log('Connecting to Deepgram with Key:', apiKey.substring(0, 5) + '...');

const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&interim_results=true&smart_format=true&filler_words=true&endpointing=500`;
const ws = new WebSocket(wsUrl, ['token', apiKey]);

ws.on('open', () => {
  console.log('STT WebSocket Connected successfully.');
  
  // Send keepalive or dummy frame if needed
  // Deepgram expects JSON keepalive: { "type": "KeepAlive" }
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('Sending KeepAlive...');
      ws.send(JSON.stringify({ type: 'KeepAlive' }));
    }
  }, 5000);
});

ws.on('message', (data) => {
  console.log('Message from Deepgram:', data.toString());
});

ws.on('error', (err) => {
  console.error('STT WebSocket Error:', err);
});

ws.on('close', (code, reason) => {
  console.log(`STT WebSocket Closed. Code: ${code}, Reason: ${reason.toString()}`);
  process.exit(0);
});

// Auto-terminate test after 20 seconds
setTimeout(() => {
  console.log('Closing connection after 20s test.');
  ws.close();
}, 20000);
