# Cryptocurrency Discord Bot v2.0

### Updated for Latest Node.js and Modern Discord.js

A comprehensive cryptocurrency Discord bot that integrates with wallet daemons via RPC commands, stores data in MariaDB/MySQL database, and provides a full suite of wallet management features for Discord servers.

## 🚀 New Features in v2.0

- **Updated for Node.js 18+** - Compatible with the latest Node.js versions
- **Discord.js v14** - Updated to use the latest Discord.js library with modern intents system
- **Enhanced Wallet Support** - Improved compatibility with newer wallet versions
- **Better Error Handling** - More robust error handling and logging
- **Modern Dependencies** - All dependencies updated to their latest stable versions
- **Improved Performance** - Optimized database connections and API calls

## 📋 Requirements

- **Node.js 18.0.0 or higher**
- **MariaDB/MySQL Database**
- **Discord Bot Token**
- **Cryptocurrency Wallet Daemon** with RPC enabled

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cryptocurrency-crypto-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL/MariaDB database
   - Import the `Cryptocurrency-crypto-bot.sql` file

4. **Configuration**
   - Copy `config.js.example` to `config.js`
   - Edit `config.js` with your settings:
     - Discord bot token
     - Database credentials
     - Wallet RPC settings
     - Bot permissions and channels

5. **Start the bot**
   ```bash
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

## 🎮 Bot Commands

### User Commands
- `+register | +r` - Register an account with the bot
- `+profile | +p` - Display account information
- `+balance | +b` - Display your current balance
- `+deposit | +d` - Get your deposit address
- `+withdraw <address> <amount> | +w <address> <amount>` - Withdraw balance
- `+tip <@username> <amount>` - Tip a user from Discord
- `+rain <all/online/random> <amount> <userCount>` - Rain coins to multiple users
- `+drop <phrase/react> <amount> <timeInSeconds> <phrase>` - Create coin drops
- `+history <deposits/withdrawals/payments>` - View transaction history
- `+stake <amount>` - Convert balance to stake balance (if staking enabled)
- `+unstake <amount>` - Convert stake balance back to normal balance
- `+update | +u` - Update your username
- `+donate` - Show donation address
- `+notify <on/off>` - Enable/disable bot mentions
- `+version | +v` - Get bot and wallet information

### Admin Commands
- `+start / +stop` - Enable/Disable all bot commands
- `+getdeposits | +gd` - Manually check for new deposits
- `+creditdeposits | +cd` - Manually credit confirmed deposits
- `+getstakes | +gs` - Manually check for stake transactions
- `+creditstakes | +cs` - Manually credit stakes to users
- `+clear | +c` - Delete visible messages from chat

## ⚙️ Configuration

The bot is highly configurable through the `config.js` file:

### Bot Settings
- Command prefix customization
- Admin/Moderator/VIP user roles
- Channel restrictions
- Cooldown settings
- Error logging

### Wallet Integration
- RPC connection settings
- Transaction confirmation requirements
- Fee settings
- Explorer links

### Staking Pool (Optional)
- Stake pool configuration
- Reward distribution
- Lock times and percentages

### Price Tracking (Optional)
- CoinMarketCap integration
- CryptoCompare integration
- Price history logging

## 🔧 Wallet Setup for Staking

If you want to enable staking features:

1. Enable staking in your wallet configuration:
   ```
   staking=1
   walletnotify=/path/to/your/bot/folder/transaction.sh %s
   ```

2. Make the transaction script executable:
   ```bash
   chmod +x transaction.sh
   ```

3. Enable staking options in `config.js`

## 🐳 Docker Support

A Dockerfile and docker-compose.yml can be created for easy deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- Keep your `config.js` file secure and never commit it to version control
- Use environment variables for sensitive data in production
- Regularly update dependencies
- Monitor bot permissions and restrict to necessary channels
- Enable proper database security

## 📊 Database Schema

The bot uses several tables:
- `user` - User accounts and balances
- `deposits` - Deposit transactions
- `withdrawals` - Withdrawal transactions
- `payments` - Internal payments (tips, rain, drops)
- `transactions` - Wallet transactions for staking
- `log` - Activity logging
- `coin_price_history` - Price tracking (if enabled)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the configuration carefully
- Review the logs for error messages
- Ensure your wallet daemon is running and accessible
- Verify database connectivity

## 🔄 Migration from v1.x

If upgrading from the original version:
1. Backup your database
2. Update Node.js to version 18+
3. Update your `config.js` file with new format
4. Run `npm install` to update dependencies
5. Test in a development environment first

---

**Note**: This bot handles real cryptocurrency transactions. Always test thoroughly in a development environment before deploying to production.