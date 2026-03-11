# Flipkart Auto JJE

An automated Flipkart shopping bot that handles product searching, price extraction, and payment processing.

## Features

- **Automated Product Search**: Search for products on Flipkart
- **Price Breakdown Extraction**: Extract detailed price breakdown including MRP, fees, and discounts
- **Payment Processing**: Automated payment form filling
- **Multi-Account Support**: Manage multiple Flipkart accounts
- **Real-time Updates**: Live status updates via WebSocket
- **Modern UI**: Clean and responsive React frontend

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development
- TailwindCSS for styling
- Lucide React for icons

### Backend
- Node.js with Express
- Playwright for browser automation
- WebSocket for real-time communication
- Supabase for database

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pranavthakwani/Flipkart-Autobot-JJE.git
cd Flipkart-Autobot-JJE
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Usage

### Starting the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Managing Accounts

1. Navigate to the Accounts tab
2. Add a new account with:
   - Account name
   - Cookie file name
   - Cookies data (from browser session)

### Processing Products

1. Navigate to the Dashboard tab
2. Select an account
3. Enter product name
4. Click "Process Product"
5. Monitor real-time progress
6. Complete payment in the payment modal

## Project Structure

```
Flipkart-Autobot-JJE/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── services/          # API services
├── backend/                # Backend Node.js code
│   ├── controllers/       # Express controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── storage/          # Browser data storage
├── supabase/             # Database migrations
└── public/               # Static assets
```

## Key Components

- **AccountsTab**: Manage Flipkart accounts and cookies
- **DashboardTab**: Main dashboard for product processing
- **ProductsTab**: View processed products
- **PaymentSection**: Handle payment form with live price breakdown
- **FlipkartBotService**: Core automation logic using Playwright

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=your_supabase_database_url

# Backend
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push to the branch
5. Open a pull request

## License

This project is for educational purposes only. Please respect Flipkart's terms of service.

## Disclaimer

This tool is intended for educational purposes. Users are responsible for complying with Flipkart's terms of service and applicable laws. The developers are not responsible for any misuse of this software.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
