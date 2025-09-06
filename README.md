# 🍎 Fruit Crush - Web3 Candy Crush Game

A modern Celo, Web3-enabled Candy Crush-style game built with Next.js and React. Players can earn tokens by playing the game and claiming rewards through smart contracts on the Celo blockchain.

## 🎮 Game Features

- **Classic Candy Crush Gameplay**: Match 3+ fruits to clear them from the board
- **Web3 Integration**: Connect your wallet and earn real tokens
- **Token Rewards**: Earn 10 tokens per move made (1:1 ratio for points to tokens)
- **Real-time UI**: Smooth animations and responsive design
- **Mobile-friendly**: Touch controls for mobile devices
- **Celo Blockchain**: Built on Celo mainnet for low-cost transactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- A Celo-compatible wallet (MetaMask, Valora, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fruit-crush
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `apps/web/.env.local` with your configuration:
   ```env
   # Thirdweb Client ID (get from https://thirdweb.com/dashboard/)
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
   
   # Contract Configuration (optional - for direct minting)
   CONTRACT_ADDRESS=0xb6585f51d25Af8D48b0995B1eb110df6a3Bf5912
   PRIVATE_KEY=your_private_key_here
   RPC_URL=https://forno.celo.org
   CHAIN_ID=42220
   DOMAIN_NAME=FruitCrush
   DOMAIN_VERSION=1
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Connect Wallet**: Click the connect button to link your Celo wallet
2. **Make Moves**: Swipe or click to swap adjacent fruits and create matches
3. **Earn Tokens**: Each successful move earns you 10 tokens
4. **Claim Rewards**: Click "Claim Tokens" to mint your earned tokens to your wallet
5. **Pay Gas**: You only pay gas fees for the claim transaction (tokens are free!)

## 🏗️ Project Structure

```
fruit-crush/
├── apps/
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/                  # Next.js app router
│       │   │   ├── api/              # Backend API routes
│       │   │   │   └── generate-mint-signature/
│       │   │   └── page.tsx          # Main game page
│       │   ├── components/           # React components
│       │   │   ├── CandyCrushgame.tsx # Main game component
│       │   │   ├── GameBoard.tsx     # Game board logic
│       │   │   ├── Candy.tsx         # Individual candy component
│       │   │   ├── ClaimButton.tsx   # Token claiming button
│       │   │   └── connect-button.tsx # Wallet connection
│       │   ├── hooks/                # Custom React hooks
│       │   │   └── useTokenClaiming.ts # Token claiming logic
│       │   ├── lib/                  # Utilities and configurations
│       │   │   ├── client.ts         # Thirdweb client setup
│       │   │   ├── contract.ts       # Smart contract integration
│       │   │   └── gameLogic.ts      # Game state management
│       │   └── types/                # TypeScript type definitions
│       └── package.json
├── package.json                      # Root package.json
└── README.md
```

## 🔧 Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Thirdweb SDK v5
- **Blockchain**: Celo Mainnet (Chain ID: 42220)
- **State Management**: React useReducer
- **Package Manager**: pnpm (with workspaces)

## 🎨 Game Mechanics

### Scoring System
- **Matches**: 3+ fruits in a row or column
- **Points**: 10 points per fruit matched
- **Tokens**: 10 tokens per move made
- **Moves**: Unlimited moves (no game over)

### Token Economics
- **Earning Rate**: 1 move = 10 tokens
- **Claiming**: Free tokens (you only pay gas)
- **Blockchain**: Celo (low gas fees)
- **Contract**: ERC-20 compatible token

## 🔐 Smart Contract Integration

The game integrates with a smart contract on Celo that supports:

- **Direct Minting**: `mintTo(address, amount)` function
- **Token Standards**: ERC-20 compatible
- **Free Tokens**: No payment required (price = 0)
- **Gas Optimization**: Efficient contract calls

### Contract Details
- **Address**: `0xb6585f51d25Af8D48b0995B1eb110df6a3Bf5912`
- **Network**: Celo Mainnet
- **Function**: `mintTo(address to, uint256 amount)`
- **Currency**: Native CELO (zero address)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Type checking
pnpm type-check       # Run TypeScript compiler
```

### Adding New Features

1. **Game Logic**: Modify `src/lib/gameLogic.ts`
2. **UI Components**: Add to `src/components/`
3. **Web3 Integration**: Update `src/hooks/useTokenClaiming.ts`
4. **Styling**: Use Tailwind classes in components

## 🐛 Troubleshooting

### Common Issues

1. **"Configuration file not found"**
   - Ensure `apps/web/.env.local` exists with proper values

2. **"Transaction failed"**
   - Check if you have CELO for gas fees
   - Verify wallet is connected to Celo Mainnet

3. **"Contract not configured"**
   - Update `CONTRACT_ADDRESS` in environment variables
   - Ensure contract ABI matches the deployed contract

4. **Wallet connection issues**
   - Make sure you have a Celo-compatible wallet installed
   - Check if wallet is connected to the correct network

### Debug Mode

Enable console logging by checking browser developer tools for detailed error messages and transaction logs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Thirdweb** for Web3 infrastructure
- **Celo** for the blockchain platform
- **Next.js** and **React** for the frontend framework
- **Tailwind CSS** for styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Open an issue on GitHub
3. Check the browser console for error messages

---

**Happy Gaming! 🎮✨**
