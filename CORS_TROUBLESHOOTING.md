# CORS Troubleshooting Guide

## Issue: 400 Bad Request / CORS Errors

If you're seeing `POST http://localhost:3001/api/create 400 (Bad Request)` or CORS-related errors, follow these steps:

## ✅ **Quick Fix Steps**

### 1. Clear Browser Cache
- **Chrome/Edge**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or use Developer Tools → Application → Storage → Clear Storage

### 2. Hard Refresh the Frontend
- Close all browser tabs with the AfriPay app
- Navigate to `http://localhost:8080`
- Press `F12` to open Developer Tools
- Right-click the refresh button and select "Empty Cache and Hard Reload"

### 3. Check Server Status
```bash
# Test backend health
curl http://localhost:3001/health

# Test CORS directly
curl -X POST http://localhost:3001/api/create \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "amount": 1,
    "description": "CORS test",
    "recipientWallet": "9CPhDgxQGHAvtHpaVjbemhPVXtN6ginqhAVyeocBN8z",
    "currency": "SOL"
  }'
```

## 🔧 **CORS Configuration**

The backend is configured to allow:
- `http://localhost:8080` (frontend)
- `http://localhost:5173` (alternative frontend port)
- Any localhost origin in development mode

## 🧪 **Test CORS in Browser**

1. Open the CORS test file:
   ```bash
   # Serve the test file
   cd /home/groot/Code/solana/afripay
   python3 -m http.server 8081
   ```

2. Navigate to `http://localhost:8081/cors-test.html`
3. Click "Test CORS Request"
4. Should see "✅ CORS Test Successful!"

## 🚨 **Common Issues**

### Browser Cache
- **Problem**: Old JavaScript is cached
- **Solution**: Hard refresh or clear cache

### Wrong Port
- **Problem**: Frontend running on different port
- **Solution**: Check frontend is on `http://localhost:8080`

### Backend Not Running
- **Problem**: Backend server stopped
- **Solution**: Restart backend:
  ```bash
  cd /home/groot/Code/solana/afripay/server
  node index.js
  ```

### Network Issues
- **Problem**: Firewall or network blocking requests
- **Solution**: Check if both servers are accessible

## 📋 **Verification Checklist**

- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend running on `http://localhost:8080`
- [ ] Browser cache cleared
- [ ] No browser extensions blocking requests
- [ ] Developer console shows no CORS errors

## 🔍 **Debug Steps**

1. **Check Browser Console**:
   - Press `F12` → Console tab
   - Look for CORS or network errors
   - Should see successful POST requests

2. **Check Network Tab**:
   - Press `F12` → Network tab
   - Try creating a payment
   - Look for failed requests (red entries)

3. **Check Backend Logs**:
   ```bash
   cd /home/groot/Code/solana/afripay/server
   tail -f server.log
   ```

## ✅ **Expected Behavior**

When working correctly:
- Payment creation returns 201 status
- No CORS errors in browser console
- QR code displays immediately
- Backend logs show successful requests

## 🆘 **Still Having Issues?**

If CORS issues persist:

1. **Restart Everything**:
   ```bash
   # Kill all processes
   pkill -f "node.*index.js"
   pkill -f "vite"
   
   # Start backend
   cd /home/groot/Code/solana/afripay/server
   node index.js &
   
   # Start frontend
   cd /home/groot/Code/solana/afripay
   npm run dev &
   ```

2. **Use Different Browser**: Try Chrome, Firefox, or Edge

3. **Check Firewall**: Ensure localhost ports are not blocked

4. **Use Incognito Mode**: Test in private/incognito browser window
