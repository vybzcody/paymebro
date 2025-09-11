# PayMeBro Frontend

A modern, feature-rich payment application built with React, TypeScript, and Vite for Solana blockchain payments using Web3Auth authentication.

## 🚀 Overview

PayMeBro is a payment platform that enables users to create and manage payment requests on the Solana blockchain. It supports both SOL and USDC payments with real-time updates, QR code generation, and comprehensive analytics.

## 🏗️ Architecture

### Core Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks and Zustand
- **Styling**: Tailwind CSS with Radix UI components
- **Routing**: Wouter (lightweight React router)
- **Blockchain**: Solana Web3.js with Web3Auth integration
- **Backend Communication**: REST API with WebSocket for real-time updates
- **UI Components**: Custom UI library based on Shadcn UI

### Key Features
- Web3Auth authentication for Solana wallets
- SOL and USDC payment creation
- Real-time payment status updates via WebSocket
- QR code generation for easy payment sharing
- Payment analytics and trends visualization
- Subscription management
- Notification system
- Template-based payment requests
- Multi-chain wallet support

## 📁 Project Structure

```
src/
├── assets/                 # Static assets and images
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/             # Layout components (navbar, etc.)
│   ├── notifications/      # Notification management
│   ├── payments/           # Payment-related components
│   ├── providers/          # Context providers (WebSocket, etc.)
│   ├── settings/           # Settings management
│   ├── subscriptions/      # Subscription management
│   ├── templates/          # Payment template components
│   └── ui/                 # Reusable UI primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and API clients
│   ├── api/               # API service clients
│   ├── config/            # Configuration files
│   └── wallet/            # Wallet-related utilities
├── pages/                 # Page components
└── App.tsx                # Main application component
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- Web3Auth Client ID (get one from [Web3Auth Dashboard](https://dashboard.web3auth.io))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd paymebro/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```bash
VITE_WEB3AUTH_CLIENT_ID=YOUR_WEB3AUTH_CLIENT_ID
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## 🧩 Key Components

### Authentication
The application uses Web3Auth for seamless blockchain authentication. Users can connect their Solana wallets through various social login options.

### Payment Creation
Users can create payment requests by:
1. Clicking "Create Payment" from the dashboard
2. Specifying amount, currency (SOL/USDC), label, and optional message
3. Generating a unique payment link and QR code

### Real-time Updates
WebSocket connections provide real-time payment status updates:
- Connection status indicators in UI
- Automatic reconnection handling
- Payment room joining for specific transactions

### Analytics
Comprehensive payment analytics including:
- Payment trends visualization
- Recent payment history
- Key metrics dashboard

## 🔧 API Integration

The frontend communicates with the backend through a REST API with the following key endpoints:

### Payments
- `POST /api/payments/create` - Create a new payment request
- `GET /api/payments/:reference/status` - Get payment status
- `POST /api/payments/confirm` - Confirm payment completion

### Authentication
- WebSocket authentication with user ID
- Payment room joining with authentication tokens

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach with responsive layouts
- Adaptive components for different screen sizes
- Touch-friendly interfaces for mobile devices

### Component Library
- Custom implementation of Shadcn UI components
- Consistent design system with Tailwind CSS
- Accessible UI components following WCAG guidelines

### Real-time Feedback
- Loading states with animated spinners
- Success/error toasts for user actions
- Connection status indicators for WebSocket

## 🧪 Testing

### Unit Testing
```bash
npm run test
```

### Component Testing
- Storybook stories for component documentation
- Visual regression testing setup

## 🚢 Deployment

### Vercel Deployment
The application is configured for easy deployment to Vercel:
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on pushes to main branch

### Docker Deployment
```bash
# Build the Docker image
docker build -t paymebro-frontend .

# Run the container
docker run -p 8080:80 paymebro-frontend
```

## 📚 Dependencies

### Core Dependencies
- `@web3auth/modal` - Web3Auth authentication
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/spl-token` - SPL token operations
- `@solana/pay` - Solana Pay protocol implementation
- `react` - UI library
- `react-router-dom` - Routing
- `tailwindcss` - Styling
- `socket.io-client` - WebSocket communication
- `@radix-ui/*` - Accessible UI components

### Development Dependencies
- `typescript` - Type checking
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting
- `@types/*` - TypeScript definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint for code formatting
- Write meaningful commit messages
- Document complex logic with comments

## 🐛 Troubleshooting

### Common Issues

1. **Web3Auth not loading**
   - Check your Web3Auth Client ID
   - Verify network connectivity
   - Clear browser cache and localStorage

2. **Payment creation fails**
   - Check backend API connectivity
   - Verify wallet connection
   - Ensure sufficient balance for gas fees

3. **WebSocket connection issues**
   - Check backend WebSocket server
   - Verify network connectivity
   - Check firewall settings

### Debugging
- Enable verbose logging in development
- Check browser console for errors
- Monitor network tab for failed requests
- Use React DevTools for component debugging

## 📖 Documentation

### Component Documentation
- Storybook stories for each component
- TypeScript interfaces for props
- JSDoc comments for functions

### API Documentation
- REST API endpoints documented in backend
- WebSocket event documentation
- Error handling guidelines

## 🔐 Security

### Authentication
- Web3Auth handles private key management
- Secure token storage in memory
- No sensitive data stored in localStorage

### Data Protection
- HTTPS-only API communication
- CORS protection on backend
- Input validation and sanitization

## 📈 Performance

### Optimization Techniques
- Code splitting with dynamic imports
- Lazy loading for non-critical components
- Image optimization and compression
- Bundle size monitoring

### Monitoring
- Performance metrics collection
- Error tracking and reporting
- User experience analytics

## 🆘 Support

For support, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Web3Auth team for authentication solutions
- Solana Foundation for blockchain infrastructure
- Tailwind Labs for CSS framework
- Radix UI for accessible components