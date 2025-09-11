const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  
  // Test authentication
  socket.emit('authenticate', 'test-user-id', (response) => {
    console.log('Authentication response:', response);
    
    if (response?.success) {
      console.log('Authentication successful');
      
      // Test joining a payment room
      const testReference = 'test-payment-reference';
      socket.emit('join-payment', testReference, response.token, (joinResponse) => {
        console.log('Join payment room response:', joinResponse);
        
        if (joinResponse?.success) {
          console.log('Successfully joined payment room');
        }
      });
    }
  });
});

socket.on('payment-update', (data) => {
  console.log('Received payment update:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('Test completed');
  socket.disconnect();
  process.exit(0);
}, 10000);