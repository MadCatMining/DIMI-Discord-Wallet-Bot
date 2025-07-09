//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

var chat = require("./chat.js");
var check = require("./check.js");
var log = require("./log.js");
var storage = require("./storage.js");
var transaction = require("./transaction.js");
var user = require("./user.js");
var wallet = require("./wallet.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Fire command
    /* ------------------------------------------------------------------------------ */

    fire_command: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        
        // Map short commands to full commands
        const commandAliases = {
            'r': 'register',
            'p': 'profile', 
            'b': 'balance',
            'd': 'deposit',
            'w': 'withdraw',
            'u': 'update',
            'v': 'version',
            'h': 'help',
            'gd': 'getdeposits',
            'cd': 'creditdeposits',
            'gs': 'getstakes',
            'cs': 'creditstakes',
            'c': 'clear'
        };

        // Convert alias to full command name
        const fullCommandName = commandAliases[commandOne] || commandOne;

        // Check if command is enabled in config
        if(!config.commands[fullCommandName]){
            console.log(`Command ${fullCommandName} is disabled in config`);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        // Check if user is currently blocked (processing another command)
        if(storage.storage_read_local_storage(userID,'blocked')){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }

        // Block user during command processing
        storage.storage_write_local_storage(userID,'blocked',true);

        try {
            console.log(`Processing command: ${fullCommandName} for user: ${userID}`);
            
            // Route to appropriate command handler using full command name
            switch(fullCommandName) {
                case 'help':
                    this.command_help(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'register':
                    this.command_register(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'profile':
                    this.command_profile(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'balance':
                    this.command_balance(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'deposit':
                    this.command_deposit(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'withdraw':
                    this.command_withdraw(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'tip':
                    this.command_tip(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'rain':
                    this.command_rain(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,serverUsers,activeUsers);
                    break;
                case 'drop':
                    this.command_drop(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,commandFive);
                    break;
                case 'history':
                    this.command_history(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'update':
                    this.command_update(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'donate':
                    this.command_donate(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'stake':
                    this.command_stake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'unstake':
                    this.command_unstake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'notify':
                    this.command_notify(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'version':
                    this.command_version(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'getdeposits':
                    this.command_get_deposits(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'creditdeposits':
                    this.command_credit_deposits(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'getstakes':
                    this.command_get_stakes(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'creditstakes':
                    this.command_credit_stakes(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'clear':
                    this.command_clear(messageFull,userID,userName,messageType,userRole);
                    break;
                default:
                    console.log(`Unknown command: ${fullCommandName}`);
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    break;
            }
        } catch (error) {
            console.error(`fire_command: Error processing command ${fullCommandName}`, error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        } finally {
            // Always unblock user after command processing
            storage.storage_delete_local_storage(userID,'blocked');
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Help command
    /* ------------------------------------------------------------------------------ */

    command_help: function(messageFull,userID,userName,messageType,userRole){
        try {
            var helpFields = [];
            
            // Normal user commands
            if(config.commands.register)
                helpFields.push([config.messages.help.registerTitle,config.messages.help.registerValue,false]);
            if(config.commands.profile)
                helpFields.push([config.messages.help.profileTitle,config.messages.help.profileValue,false]);
            if(config.commands.balance)
                helpFields.push([config.messages.help.balanceTitle,config.messages.help.balanceValue,false]);
            if(config.commands.deposit)
                helpFields.push([config.messages.help.depositTitle,config.messages.help.depositValue,false]);
            if(config.commands.withdraw)
                helpFields.push([config.messages.help.withdrawTitle,config.messages.help.withdrawValue,false]);
            if(config.commands.stake)
                helpFields.push([config.messages.help.stakeTitle,config.messages.help.stakeValue,false]);
            if(config.commands.unstake)
                helpFields.push([config.messages.help.unstakeTitle,config.messages.help.unstakeValue,false]);
            if(config.commands.tip)
                helpFields.push([config.messages.help.tipTitle,config.messages.help.tipValue,false]);
            if(config.commands.rain)
                helpFields.push([config.messages.help.rainTitle,config.messages.help.rainValue,false]);
            if(config.commands.drop)
                helpFields.push([config.messages.help.dropTitle,config.messages.help.dropValue,false]);
            if(config.commands.history)
                helpFields.push([config.messages.help.historyTitle,config.messages.help.historyValue,false]);
            if(config.commands.update)
                helpFields.push([config.messages.help.updateTitle,config.messages.help.updateValue,false]);
            if(config.commands.donate)
                helpFields.push([config.messages.help.donateTitle,config.messages.help.donateValue,false]);
            if(config.commands.notify)
                helpFields.push([config.messages.help.notifyTitle,config.messages.help.notifyValue,false]);
            if(config.commands.version)
                helpFields.push([config.messages.help.versionTitle,config.messages.help.versionValue,false]);

            // Admin commands
            if(userRole >= 3){
                helpFields.push([0,0,false]); // Empty line
                helpFields.push([config.messages.help.admin.title,'',false]);
                if(config.commands.startstop)
                    helpFields.push([config.messages.help.admin.startStopTitle,config.messages.help.admin.startStopValue,false]);
                if(config.commands.getdeposits)
                    helpFields.push([config.messages.help.admin.getDepositsTitle,config.messages.help.admin.getDepositsValue,false]);
                if(config.commands.creditdeposits)
                    helpFields.push([config.messages.help.admin.creditDepositsTitle,config.messages.help.admin.creditDepositsValue,false]);
                if(config.commands.getstakes)
                    helpFields.push([config.messages.help.admin.getStakesTitle,config.messages.help.admin.getStakesValue,false]);
                if(config.commands.creditstakes)
                    helpFields.push([config.messages.help.admin.creditStakesTitle,config.messages.help.admin.creditStakesValue,false]);
                if(config.commands.clear)
                    helpFields.push([config.messages.help.admin.clearTitle,config.messages.help.admin.clearValue,false]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.help.title,helpFields,false,false,false,false,1);
        } catch (error) {
            console.error('command_help: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Register command
    /* ------------------------------------------------------------------------------ */

    command_register: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is already registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.register.already,false,false,false,false);
                return;
            }

            // Register user
            const userNameString = check.check_slice_string(userName.username, 30);
            const registerResult = await user.user_register(userNameString, userID);
            
            if(!registerResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log registration
            log.log_write_database(userID, config.messages.log.registered);
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,1);
            
        } catch (error) {
            console.error('command_register: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Profile command
    /* ------------------------------------------------------------------------------ */

    command_profile: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user info
            const userInfo = await user.user_get_info(userID);
            
            if(!userInfo || userInfo.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const userData = userInfo[0];
            const registerDate = moment(userData.register_datetime).format('YYYY-MM-DD HH:mm:ss');

            const profileFields = [
                [config.messages.profile.userid, userID, true],
                [config.messages.profile.username, userData.username, true],
                [config.messages.profile.registered, registerDate, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,profileFields,config.messages.profile.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_profile: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Balance command
    /* ------------------------------------------------------------------------------ */

    command_balance: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user info
            const userInfo = await user.user_get_info(userID);
            
            if(!userInfo || userInfo.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const userData = userInfo[0];
            const balance = Big(userData.balance).toFixed(8);
            
            let balanceFields = [
                [config.messages.balance.username, userData.username, true],
                [config.messages.balance.balance, balance + ' ' + config.wallet.coinSymbolShort, true]
            ];

            // Add stake balance if staking is enabled and user has stake balance
            if(config.staking.balanceDisplay && Big(userData.stake_balance).gt(0)){
                const stakeBalance = Big(userData.stake_balance).toFixed(8);
                balanceFields.push([config.messages.balance.stakeTitle, stakeBalance + ' ' + config.wallet.coinSymbolShort, true]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,balanceFields,false,false,false,false,1);
            
        } catch (error) {
            console.error('command_balance: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Deposit command
    /* ------------------------------------------------------------------------------ */

    command_deposit: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user address
            let userAddress = await user.user_get_address(userID);
            
            // If no address exists, create one
            if(!userAddress){
                userAddress = await wallet.wallet_create_deposit_address();
                
                if(!userAddress){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                    return;
                }

                // Save address to database
                const saveResult = await user.user_add_deposit_address(userAddress, userID);
                
                if(!saveResult){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Log address creation
                log.log_write_database(userID, config.messages.log.depositaddress + ' ' + userAddress);
            }

            const depositFields = [
                [config.messages.deposit.address, userAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,depositFields,config.messages.deposit.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_deposit: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Withdraw command
    /* ------------------------------------------------------------------------------ */

    command_withdraw: async function(messageFull,userID,userName,messageType,userRole,withdrawAddress,withdrawAmount){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!withdrawAddress || !withdrawAmount){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(withdrawAmount) || Big(withdrawAmount).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum withdrawal amount
            if(Big(withdrawAmount).lt(config.wallet.minWithdrawalValue)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.min + ' ' + config.wallet.minWithdrawalValue + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Validate address
            const addressValid = await wallet.wallet_validate_address(withdrawAddress);
            
            if(addressValid === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }
            
            if(!addressValid){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.notvalid,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            
            if(!userBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Calculate total amount needed (amount + fee)
            const totalNeeded = Big(withdrawAmount).plus(config.wallet.transactionFee);
            
            if(Big(userBalance).lt(totalNeeded)){
                const maxWithdraw = Big(userBalance).minus(config.wallet.transactionFee);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.big + ' ' + withdrawAmount + ' ' + config.messages.withdraw.big1 + ' ' + config.wallet.transactionFee + ' ' + config.messages.withdraw.big2 + ' ' + totalNeeded.toFixed(8) + ' ' + config.messages.withdraw.big3 + ' ' + userBalance + ' ' + config.messages.withdraw.big4 + ' ' + maxWithdraw.toFixed(8) + ' ' + config.wallet.coinSymbolShort + config.messages.withdraw.big5,false,false,false,false);
                return;
            }

            // Send withdrawal
            const txid = await wallet.wallet_send_to_address(withdrawAddress, withdrawAmount);
            
            if(!txid){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Subtract balance
            const subtractResult = await user.user_substract_balance(totalNeeded, userID);
            
            if(!subtractResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
                return;
            }

            // Save withdrawal to database
            const saveResult = await transaction.transaction_save_withdrawal_to_db(userID, withdrawAddress, withdrawAmount, txid);
            
            if(!saveResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
                return;
            }

            // Log withdrawal
            log.log_write_database(userID, config.messages.log.withdrawrequest + ' ' + withdrawAddress, withdrawAmount);

            const withdrawFields = [
                [config.messages.withdraw.amount, withdrawAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.withdraw.address, withdrawAddress, false],
                [config.messages.withdraw.transaction, config.wallet.explorerLinkTransaction + txid, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,withdrawFields,config.messages.withdraw.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_withdraw: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Tip command
    /* ------------------------------------------------------------------------------ */

    command_tip: async function(messageFull,userID,userName,messageType,userRole,tipUser,tipAmount){
        try {
            // Check if private message
            if(messageType === 1){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.private,false,false,false,false);
                return;
            }

            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!tipUser || !tipAmount){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate tip user format
            if(!check.check_valid_discord_id(tipUser)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.notvalid,false,false,false,false);
                return;
            }

            // Extract user ID from mention
            const tipUserID = tipUser.replace(/[<@!>]/g, '');

            // Check if trying to tip self
            if(tipUserID === userID){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.self,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(tipAmount) || Big(tipAmount).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum tip amount
            if(Big(tipAmount).lt(config.wallet.minTipValue)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.min + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Check if tip recipient is registered
            const tipUserRegistered = await user.user_registered_check(tipUserID);
            
            if(tipUserRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!tipUserRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.no,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            
            if(!userBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(tipAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.big + ' ' + tipAmount + ' ' + config.messages.tip.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.tip.big2,false,false,false,false);
                return;
            }

            // Process tip
            const subtractResult = await user.user_substract_balance(tipAmount, userID);
            const addResult = await user.user_add_balance(tipAmount, tipUserID);
            
            if(!subtractResult || !addResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Save payment to database
            const saveResult = await transaction.transaction_save_payment_to_db(tipAmount, userID, tipUserID, config.messages.payment.tip.send);
            
            // Log tip
            log.log_write_database(userID, config.messages.log.tip + ' ' + tipUserID, tipAmount);

            const tipFields = [
                [config.messages.tip.amount, tipAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.tip.user, tipUser, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.tip.title,tipFields,config.messages.tip.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_tip: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Rain command
    /* ------------------------------------------------------------------------------ */

        try {
            // Check if command is enabled
            if(!config.commands.rain){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.comingSoon,false,false,false,false);
                return;
            }
            
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered == 'error'){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            if(!userRegistered){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }
            
            // Check if user is blocked
            var userBlocked = storage.storage_read_local_storage(userID,'blocked');
            if(userBlocked){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
                return;
            }
            
            // Block user
            storage.storage_write_local_storage(userID,'blocked',1);
            
            // Check if it's a private message
            if(messageType === 1){ // DM
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.private,false,false,false,false);
                storage.storage_delete_local_storage(userID,'blocked');
                return;
            }
            
            // Validate rain type
            if(!commandTwo || (commandTwo !== 'all' && commandTwo !== 'online' && commandTwo !== 'random')){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                storage.storage_delete_local_storage(userID,'blocked');
                return;
            }
            
            // Validate amount
            if(!commandThree || !check.check_isNumeric(commandThree) || Big(commandThree).lte(0)){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                storage.storage_delete_local_storage(userID,'blocked');
                return;
            }
            
            var rainAmount = Big(commandThree);
            
            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(!userBalance){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                storage.storage_delete_local_storage(userID,'blocked');
                return;
            }
            
            // Check if user has enough balance
            if(Big(userBalance).lt(rainAmount)){
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.big + ' ' + rainAmount.toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.rain.big2,false,false,false,false);
                storage.storage_delete_local_storage(userID,'blocked');
                return;
            }
            
            var rainUsers = [];
            var rainUserCount = 0;
            
            if(commandTwo === 'all'){
                // Rain to all registered users
                var totalUsers = await user.user_get_total_count();
                if(!totalUsers || totalUsers.length === 0){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                rainUserCount = totalUsers[0].totalusers;
                
                // Check minimum amount per user
                var amountPerUser = rainAmount.div(rainUserCount);
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Subtract balance from sender
                var balanceSubtracted = await user.user_substract_balance(rainAmount.toString(),userID);
                if(!balanceSubtracted){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Add balance to all users
                var balanceAdded = await user.user_add_balance_all(amountPerUser.toString());
                if(!balanceAdded){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Log transaction
                log.log_write_database(userID,config.messages.log.rain + ' ' + rainUserCount + ' ' + config.messages.log.rain1,rainAmount.toString());
                
                // Save payment to database
                transaction.transaction_save_payment_to_db(rainAmount.toString(),userID,'rainall',config.messages.payment.rain.send);
                
                // Send success message
                var replyFields = [
                    [config.messages.rain.amount,rainAmount.toString() + ' ' + config.wallet.coinSymbolShort + ' (' + config.messages.rain.rounded + ' ' + amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort + ')',true],
                    [config.messages.rain.users,rainUserCount.toString(),true],
                    [config.messages.rain.each,amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort,true]
                ];
                
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
                
            } else if(commandTwo === 'online'){
                // Rain to online users
                var onlineUserCount = Object.keys(activeUsers).length;
                if(onlineUserCount === 0){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Check minimum amount per user
                var amountPerUser = rainAmount.div(onlineUserCount);
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + onlineUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Subtract balance from sender
                var balanceSubtracted = await user.user_substract_balance(rainAmount.toString(),userID);
                if(!balanceSubtracted){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Add balance to each online user
                var successCount = 0;
                for(var activeUserID in activeUsers){
                    if(activeUserID !== userID){ // Don't rain to self
                        var userRegisteredCheck = await user.user_registered_check(activeUserID);
                        if(userRegisteredCheck){
                            var balanceAdded = await user.user_add_balance(amountPerUser.toString(),activeUserID);
                            if(balanceAdded){
                                successCount++;
                                // Save payment to database
                                transaction.transaction_save_payment_to_db(amountPerUser.toString(),userID,activeUserID,config.messages.payment.rain.received);
                            }
                        }
                    }
                }
                
                // Log transaction
                log.log_write_database(userID,config.messages.log.rain + ' ' + successCount + ' ' + config.messages.log.rain1,rainAmount.toString());
                
                // Send success message
                var replyFields = [
                    [config.messages.rain.amount,rainAmount.toString() + ' ' + config.wallet.coinSymbolShort + ' (' + config.messages.rain.rounded + ' ' + amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort + ')',true],
                    [config.messages.rain.users,successCount.toString(),true],
                    [config.messages.rain.each,amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort,true]
                ];
                
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
                
            } else if(commandTwo === 'random'){
                // Rain to random users
                if(!commandFour || !check.check_isNumeric(commandFour) || parseInt(commandFour) <= 0){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                var requestedUserCount = parseInt(commandFour);
                
                // Check maximum random users
                if(requestedUserCount > config.wallet.maxRainRandomUsers){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.randommax + ' ' + config.wallet.maxRainRandomUsers + ' ' + config.messages.rain.randommax1,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Get random users from database
                var randomUsers = await user.user_get_discord_ids(requestedUserCount);
                if(!randomUsers || randomUsers.length === 0){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                var actualUserCount = randomUsers.length;
                
                // Check minimum amount per user
                var amountPerUser = rainAmount.div(actualUserCount);
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + actualUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Subtract balance from sender
                var balanceSubtracted = await user.user_substract_balance(rainAmount.toString(),userID);
                if(!balanceSubtracted){
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    storage.storage_delete_local_storage(userID,'blocked');
                    return;
                }
                
                // Add balance to each random user
                var successCount = 0;
                for(var i = 0; i < randomUsers.length; i++){
                    var randomUserID = randomUsers[i].discord_id;
                    if(randomUserID !== userID){ // Don't rain to self
                        var balanceAdded = await user.user_add_balance(amountPerUser.toString(),randomUserID);
                        if(balanceAdded){
                            successCount++;
                            // Save payment to database
                            transaction.transaction_save_payment_to_db(amountPerUser.toString(),userID,randomUserID,config.messages.payment.rain.received);
                        }
                    }
                }
                
                // Log transaction
                log.log_write_database(userID,config.messages.log.rain + ' ' + successCount + ' ' + config.messages.log.rain1,rainAmount.toString());
                
                // Send success message
                var replyFields = [
                    [config.messages.rain.amount,rainAmount.toString() + ' ' + config.wallet.coinSymbolShort + ' (' + config.messages.rain.rounded + ' ' + amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort + ')',true],
                    [config.messages.rain.users,successCount.toString(),true],
                    [config.messages.rain.each,amountPerUser.toString() + ' ' + config.wallet.coinSymbolShort,true]
                ];
                
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
            }
            
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            
        } catch(error) {
            var errorMessage = "command_rain: Error processing rain command";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            
            // Unblock user on error
            storage.storage_delete_local_storage(userID,'blocked');
        }
                    type: 'phrase',
                    phrase: dropPhrase,
                    amount: dropAmount,
                    creator: userID,
                    participants: [],
                    messageId: dropMessage ? dropMessage.id : null
                });

            } else if(dropType === 'react'){
                dropFields = [
                    [config.messages.drop.icon, config.bot.dropReactIcon, false],
                    [config.messages.drop.amount, dropAmount + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.drop.seconds, dropTime, true]
                ];

                dropMessage = await chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.special,false,config.messages.drop.title,dropFields,config.messages.drop.dropReactReply,false,false,false,1);

                // Add reaction to message
                if(dropMessage){
                    try {
                        await dropMessage.react(config.bot.dropReactIcon);
                    } catch (error) {
                        console.error('Failed to add reaction to drop message:', error);
                    }
                }

                // Store drop info for processing
                storage.storage_write_local_storage('drop_' + messageFull.channel.id, 'active', {
                    type: 'react',
                    amount: dropAmount,
                    creator: userID,
                    participants: [],
                    messageId: dropMessage ? dropMessage.id : null
                });

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Set timeout to end drop
            setTimeout(async () => {
                await this.process_drop_end(messageFull.channel.id, messageFull);
            }, parseInt(dropTime) * 1000);
            
        } catch (error) {
            console.error('command_drop: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process drop end
    /* ------------------------------------------------------------------------------ */

    process_drop_end: async function(channelId, messageFull){
        try {
            const dropInfo = storage.storage_read_local_storage('drop_' + channelId, 'active');
            
            if(!dropInfo){
                return;
            }

            const participants = dropInfo.participants || [];
            const participantCount = participants.length;

            if(participantCount < config.bot.dropMinUsers){
                // Not enough participants, refund
                await user.user_add_balance(dropInfo.amount, dropInfo.creator);
                
                const failFields = [
                    [config.messages.drop.minFailedUser, participantCount + ' ' + config.messages.drop.minFailedUser1 + ' ' + config.bot.dropMinUsers + ' ' + config.messages.drop.minFailedUser2, false]
                ];

                chat.chat_reply(messageFull,'embed',false,messageFull.channel.type,config.colors.warning,false,config.messages.drop.minFailedUserTitle,failFields,false,false,false,false,1);
            } else {
                // Distribute drop
                const amountPerUser = Big(dropInfo.amount).div(participantCount);

                for(const participantId of participants){
                    await user.user_add_balance(amountPerUser, participantId);
                    await transaction.transaction_save_payment_to_db(amountPerUser, dropInfo.creator, participantId, config.messages.payment.drop.send);
                }

                // Log drop
                log.log_write_database(dropInfo.creator, config.messages.log.drop + ' ' + participantCount + ' ' + config.messages.log.drop1, dropInfo.amount);

                const successFields = [
                    [config.messages.drop.amount, dropInfo.amount + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.drop.rounded, amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.drop.users, participantCount, true],
                    [config.messages.drop.each, amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]
                ];

                chat.chat_reply(messageFull,'embed',false,messageFull.channel.type,config.colors.success,false,config.messages.drop.titleSent,successFields,config.messages.drop.description,false,false,false,1);
            }

            // Clean up drop info
            storage.storage_delete_local_storage('drop_' + channelId, 'active');
            
        } catch (error) {
            console.error('process_drop_end: Error', error);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // History command
    /* ------------------------------------------------------------------------------ */

    command_history: async function(messageFull,userID,userName,messageType,userRole,historyType){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            if(!historyType){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            if(historyType === 'deposits' || historyType === 'd'){
                // Get user deposit address
                const userAddress = await user.user_get_address(userID);
                
                if(!userAddress){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                // Get deposits
                const deposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory, userAddress);
                
                if(!deposits || deposits.length === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                let historyFields = [];
                
                for(const deposit of deposits){
                    const status = deposit.credited ? config.messages.history.deposits.credited : config.messages.history.deposits.pending;
                    const txLink = config.wallet.explorerLinkTransaction + deposit.txid;
                    
                    historyFields.push([config.messages.history.deposits.amount, deposit.amount + ' ' + config.wallet.coinSymbolShort, true]);
                    historyFields.push([config.messages.history.deposits.status, status, true]);
                    historyFields.push([config.messages.history.deposits.confirmations, deposit.confirmations.toString(), true]);
                    historyFields.push([config.messages.history.deposits.view, txLink, false]);
                    historyFields.push([0,0,false]); // Empty line
                }

                const description = config.messages.history.deposits.description + ' ' + config.wallet.minConfirmationsCredit + ' ' + config.messages.history.deposits.description1 + ' ' + config.wallet.depositsConfirmationTime + ' ' + config.messages.history.deposits.description2;

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,historyFields,description,false,false,false,1);

            } else if(historyType === 'withdrawals' || historyType === 'w'){
                // Get withdrawals
                const withdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount, userID);
                
                if(!withdrawals || withdrawals.length === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                    return;
                }

                let historyFields = [];
                
                for(const withdrawal of withdrawals){
                    const txLink = config.wallet.explorerLinkTransaction + withdrawal.txid;
                    const date = moment(withdrawal.datetime).format('YYYY-MM-DD HH:mm:ss');
                    
                    historyFields.push([config.messages.history.deposits.amount, withdrawal.amount + ' ' + config.wallet.coinSymbolShort, true]);
                    historyFields.push(['Date', date, true]);
                    historyFields.push(['Address', withdrawal.address, false]);
                    historyFields.push([config.messages.history.deposits.view, txLink, false]);
                    historyFields.push([0,0,false]); // Empty line
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,historyFields,config.messages.history.withdrawals.description,false,false,false,1);

            } else if(historyType === 'payments' || historyType === 'p'){
                // Get payments
                const payments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun, userID);
                
                if(!payments || payments.length === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                    return;
                }

                let historyFields = [];
                
                for(const payment of payments){
                    const date = moment(payment.datetime).format('YYYY-MM-DD HH:mm:ss');
                    
                    historyFields.push([config.messages.history.payments.type, payment.type, true]);
                    historyFields.push([config.messages.history.payments.amount, payment.amount + ' ' + config.wallet.coinSymbolShort, true]);
                    historyFields.push(['Date', date, true]);
                    historyFields.push([0,0,false]); // Empty line
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,historyFields,config.messages.history.payments.description,false,false,false,1);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }
            
        } catch (error) {
            console.error('command_history: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Update command
    /* ------------------------------------------------------------------------------ */

    command_update: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Update username
            const userNameString = check.check_slice_string(userName.username, 30);
            const updateResult = await user.user_update_username(userNameString, userID);
            
            if(!updateResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log update
            log.log_write_database(userID, config.messages.log.username + ' ' + userNameString);
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_update: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Donate command
    /* ------------------------------------------------------------------------------ */

    command_donate: function(messageFull,userID,userName,messageType,userRole){
        try {
            const donateFields = [
                [config.messages.donate.address, config.wallet.donateAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,donateFields,config.messages.donate.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_donate: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Stake command
    /* ------------------------------------------------------------------------------ */

    command_stake: async function(messageFull,userID,userName,messageType,userRole,stakeAmount){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate amount
            if(!stakeAmount || !check.check_isNumeric(stakeAmount) || Big(stakeAmount).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum stake amount
            if(Big(stakeAmount).lt(config.staking.minStake)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.min + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            
            if(!userBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(stakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.big + ' ' + stakeAmount + ' ' + config.messages.stake.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.stake.big2,false,false,false,false);
                return;
            }

            // Process stake
            const currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            
            const subtractResult = await user.user_substract_balance(stakeAmount, userID);
            const addStakeResult = await user.user_add_stake_balance(stakeAmount, userID, currentDatetime);
            
            if(!subtractResult || !addStakeResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log stake
            log.log_write_database(userID, config.messages.log.stake + ' -> ' + config.messages.log.stakeadd, stakeAmount);

            const stakeFields = [
                [config.messages.stake.amount, stakeAmount + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.stake.title,stakeFields,config.messages.stake.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_stake: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Unstake command
    /* ------------------------------------------------------------------------------ */

    command_unstake: async function(messageFull,userID,userName,messageType,userRole,unstakeAmount){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate amount
            if(!unstakeAmount || !check.check_isNumeric(unstakeAmount) || Big(unstakeAmount).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum unstake amount
            if(Big(unstakeAmount).lt(config.staking.minUnstake)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.min + ' ' + config.staking.minUnstake + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Get user info
            const userInfo = await user.user_get_info(userID);
            
            if(!userInfo || userInfo.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const userData = userInfo[0];
            const stakeBalance = Big(userData.stake_balance);

            // Check if user has enough stake balance
            if(stakeBalance.lt(unstakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.big + ' ' + unstakeAmount + ' ' + config.messages.unstake.big1 + ' ' + stakeBalance.toFixed(8) + ' ' + config.wallet.coinSymbolShort + config.messages.unstake.big2,false,false,false,false);
                return;
            }

            // Check lock time
            const currentTime = moment().tz(config.staking.timezone);
            const lastUnstakeTime = moment(userData.unstake_datetime).tz(config.staking.timezone);
            const timeDiff = currentTime.diff(lastUnstakeTime, 'seconds');

            if(timeDiff < config.staking.lockTime){
                const timeLeft = config.staking.lockTime - timeDiff;
                const days = Math.floor(timeLeft / 86400);
                const hours = Math.floor((timeLeft % 86400) / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                let timeString = '';
                if(days > 0) timeString += days + ' ' + config.messages.unstake.leftdays + ' ';
                if(hours > 0) timeString += hours + ' ' + config.messages.unstake.lefthours + ' ';
                if(minutes > 0) timeString += minutes + ' ' + config.messages.unstake.leftminutes + ' ';
                if(seconds > 0) timeString += seconds + ' ' + config.messages.unstake.leftseconds;

                const lockFields = [
                    [config.messages.unstake.left, timeString + config.messages.unstake.left2, false]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.unstake.locked,lockFields,false,false,false,false,1);
                return;
            }

            // Check if remaining stake would be below minimum
            const remainingStake = stakeBalance.minus(unstakeAmount);
            let actualUnstakeAmount = unstakeAmount;

            if(remainingStake.gt(0) && remainingStake.lt(config.staking.minStake)){
                // Unstake everything
                actualUnstakeAmount = stakeBalance.toFixed(8);
                
                const restFields = [
                    [config.messages.unstake.rest, remainingStake.toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.unstake.rest2 + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort + config.messages.unstake.rest3, false]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,restFields,false,false,false,false,1);
            }

            // Process unstake
            const currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            
            const subtractStakeResult = await user.user_substract_stake_balance(actualUnstakeAmount, userID, currentDatetime);
            const addBalanceResult = await user.user_add_balance(actualUnstakeAmount, userID);
            
            if(!subtractStakeResult || !addBalanceResult){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log unstake
            log.log_write_database(userID, config.messages.log.unstake + ' -> ' + config.messages.log.unstakeadd, actualUnstakeAmount);

            const unstakeFields = [
                [config.messages.unstake.amount, actualUnstakeAmount + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.unstake.title,unstakeFields,config.messages.unstake.description,false,false,false,1);
            
        } catch (error) {
            console.error('command_unstake: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Notify command
    /* ------------------------------------------------------------------------------ */

    command_notify: async function(messageFull,userID,userName,messageType,userRole,notifyOption){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            
            if(isRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            if(!notifyOption || (notifyOption !== 'on' && notifyOption !== 'off')){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Store notification preference
            const notifyEnabled = notifyOption === 'on';
            storage.storage_write_local_storage(userID, 'notify', notifyEnabled);

            const message = notifyEnabled ? config.messages.notify.enabled : config.messages.notify.disabled;
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,message,false,false,false,1);
            
        } catch (error) {
            console.error('command_notify: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Version command
    /* ------------------------------------------------------------------------------ */

    command_version: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Get wallet info
            const walletInfo = await wallet.wallet_get_info();
            
            let versionFields = [];
            
            if(walletInfo && walletInfo !== 'error'){
                // Handle different wallet info structures
                const botVersion = config.bot.version || 'Unknown';
                const walletVersion = walletInfo.version || walletInfo.walletversion || 'Unknown';
                const protocolVersion = walletInfo.protocolversion || 'Unknown';
                const connections = walletInfo.connections || 0;
                const blocks = walletInfo.blocks || 0;
                const difficulty = walletInfo.difficulty || 0;
                
                versionFields = [
                    [config.messages.version.botversion, String(botVersion), true],
                    [config.messages.version.walletversion, String(walletVersion), true],
                    [config.messages.version.walletprotocolversion, String(protocolVersion), true],
                    [config.messages.version.walletconnections, String(connections), true],
                    [config.messages.version.walletblocks, String(blocks), true],
                    [config.messages.version.walletdifficulty, String(difficulty), true]
                ];
            } else {
                // Wallet offline or error
                versionFields = [
                    [config.messages.version.botversion, String(config.bot.version || 'Unknown'), true],
                    [config.messages.version.walletversion, 'Wallet Offline', true],
                    [config.messages.version.walletprotocolversion, 'Wallet Offline', true],
                    [config.messages.version.walletconnections, 'Wallet Offline', true],
                    [config.messages.version.walletblocks, 'Wallet Offline', true],
                    [config.messages.version.walletdifficulty, 'Wallet Offline', true]
                ];
            }
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,versionFields,false,false,false,false,1);
            
        } catch (error) {
            console.error('command_version: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get deposits command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_get_deposits: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user has admin privileges
            if(userRole < 3){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Get latest deposits from wallet
            const latestDeposits = await wallet.wallet_get_latest_deposits();
            
            if(!latestDeposits){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                }
                return;
            }

            let processedCount = 0;

            for(const deposit of latestDeposits){
                if(deposit.category === 'receive' && deposit.confirmations <= config.wallet.minConfirmationsDeposit){
                    const saveResult = await transaction.transaction_add_update_deposits_on_db(deposit.address, deposit.amount, deposit.confirmations, deposit.txid);
                    if(saveResult){
                        processedCount++;
                    }
                }
            }

            console.log(`Processed ${processedCount} deposits`);

            if(messageFull) {
                const message = messageFull ? config.messages.getdeposits.manually : config.messages.getdeposits.cron;
                const message2 = messageFull ? config.messages.getdeposits.deposits : config.messages.getdeposits.cron2;
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,message + ' ' + processedCount + ' ' + message2,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_get_deposits: Error', error);
            if(messageFull) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit deposits command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user has admin privileges (only if called from user command)
            if(messageFull && userRole < 3){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Get confirmed deposits
            const confirmedDeposits = await transaction.transaction_get_confirmed_deposits();
            
            if(!confirmedDeposits){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                }
                return;
            }

            let creditedCount = 0;

            for(const deposit of confirmedDeposits){
                // Get user ID by address
                const depositUserID = await user.user_get_id_by_address(deposit.address);
                
                if(depositUserID && depositUserID !== 'notregisteredaddress'){
                    // Credit balance to user
                    const creditResult = await user.user_credit_balance(deposit.address, deposit.amount);
                    
                    if(creditResult){
                        // Mark deposit as credited
                        const markResult = await transaction.transaction_set_deposit_confirmed(deposit.id);
                        
                        if(markResult){
                            creditedCount++;
                            
                            // Log credit
                            log.log_write_database(depositUserID, config.messages.log.transctioncredited + ' ' + deposit.address, deposit.amount);
                        }
                    }
                } else {
                    // Unknown address, still mark as credited to avoid reprocessing
                    await transaction.transaction_set_deposit_confirmed(deposit.id);
                    log.log_write_database('unknown', config.messages.log.transctioncreditedunknown + ' ' + deposit.address, deposit.amount);
                }
            }

            console.log(`Credited ${creditedCount} deposits`);

            if(messageFull) {
                const message = messageFull ? config.messages.creditdeposits.manually : config.messages.creditdeposits.cron;
                const message2 = messageFull ? config.messages.creditdeposits.deposits : config.messages.creditdeposits.cron2;
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,message + ' ' + creditedCount + ' ' + message2,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_credit_deposits: Error', error);
            if(messageFull) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get stakes command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user has admin privileges (only if called from user command)
            if(messageFull && userRole < 3){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Get unchecked transactions
            const uncheckedTransactions = await transaction.transaction_get_stake_transactions();
            
            if(!uncheckedTransactions){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                }
                return;
            }

            let processedCount = 0;

            for(const txRecord of uncheckedTransactions){
                // Get transaction details from wallet
                const tx = await wallet.wallet_get_transaction(txRecord.txid);
                
                if(tx && tx.category === 'stake'){
                    // Calculate stake reward
                    const stakeReward = await wallet.wallet_calculate_stake_reward(tx);
                    
                    if(stakeReward && stakeReward > 0){
                        // Update transaction as stake
                        const updateResult = await transaction.transaction_update_stake_transaction(txRecord.txid, stakeReward, 1);
                        
                        if(updateResult){
                            processedCount++;
                            
                            if(config.staking.debug){
                                console.log(`Stake found: ${txRecord.txid} - Reward: ${stakeReward}`);
                            }
                        }
                    } else {
                        // Not a stake or no reward, mark as checked
                        await transaction.transaction_update_stake_transaction(txRecord.txid, 0, 0);
                    }
                } else {
                    // Not a stake transaction, mark as checked
                    await transaction.transaction_update_stake_transaction(txRecord.txid, 0, 0);
                }
            }

            console.log(`Processed ${processedCount} stake transactions`);

            if(messageFull) {
                const message = messageFull ? config.messages.getstakes.manually : config.messages.getstakes.cron;
                const message2 = messageFull ? config.messages.getstakes.transactions : config.messages.getstakes.cron2;
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,message + ' ' + processedCount + ' ' + message2,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_get_stakes: Error', error);
            if(messageFull) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit stakes command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user has admin privileges (only if called from user command)
            if(messageFull && userRole < 3){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Get wallet balance
            const walletBalance = await wallet.wallet_get_balance();
            
            if(!walletBalance){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                }
                return;
            }

            // Get stake transactions to credit
            const stakeTransactions = await transaction.transaction_get_stake_transactions_to_credit();
            
            if(!stakeTransactions || stakeTransactions.length === 0){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,'No stakes to credit',false,false,false,false);
                }
                return;
            }

            // Get all stake users
            const stakeUsers = await user.user_get_stake_users();
            
            if(!stakeUsers || stakeUsers.length === 0){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,false,false,'No users with stake balance found',false,false,false,false);
                }
                return;
            }

            // Calculate total stake amount from transactions
            let totalStakeAmount = Big(0);
            let highestTransactionID = 0;
            
            for(const stakeTransaction of stakeTransactions){
                totalStakeAmount = totalStakeAmount.plus(stakeTransaction.amount);
                if(stakeTransaction.id > highestTransactionID){
                    highestTransactionID = stakeTransaction.id;
                }
            }

            // Calculate total stake balance of all users
            let totalUserStakeBalance = Big(0);
            for(const stakeUser of stakeUsers){
                totalUserStakeBalance = totalUserStakeBalance.plus(stakeUser.stake_balance);
            }

            if(totalUserStakeBalance.eq(0)){
                if(messageFull) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,false,false,'Total user stake balance is 0',false,false,false,false);
                }
                return;
            }

            // Calculate amount for stakers (minus owner percentage)
            const ownerPercentage = Big(config.staking.ownerPercentage).div(100);
            const totalStakeForStakers = totalStakeAmount.times(Big(1).minus(ownerPercentage));

            if(config.staking.debug){
                console.log(config.messages.log.stakecredit + ' ' + walletBalance);
                console.log(config.messages.log.stakecredit1 + ' ' + totalStakeAmount.toFixed(8));
                console.log(config.messages.log.stakecredit2 + ' ' + totalStakeForStakers.toFixed(8));
                console.log(config.messages.log.stakecredit3 + ' ' + stakeUsers.length);
                console.log(config.messages.log.stakecredit5 + ' ' + totalUserStakeBalance.toFixed(8));
                console.log(config.messages.log.stakecredit6 + ' ' + totalStakeForStakers.toFixed(8));
                console.log(config.messages.log.stakecredit7 + ' ' + stakeTransactions.map(tx => tx.id).join(', '));
            }

            let creditedUsers = 0;

            // Credit each stake user proportionally
            for(const stakeUser of stakeUsers){
                const userStakeBalance = Big(stakeUser.stake_balance);
                const userProportion = userStakeBalance.div(totalUserStakeBalance);
                const userCreditAmount = totalStakeForStakers.times(userProportion);

                if(userCreditAmount.gt(0)){
                    // Add balance to user
                    const creditResult = await user.user_add_balance(userCreditAmount, stakeUser.discord_id);
                    
                    if(creditResult){
                        creditedUsers++;
                        
                        // Save payment record
                        await transaction.transaction_save_payment_to_db(userCreditAmount, config.bot.botID, stakeUser.discord_id, config.messages.payment.stake.received);
                        
                        // Log stake credit
                        log.log_write_database(stakeUser.discord_id, config.messages.payment.stake.received, userCreditAmount);

                        if(config.staking.debug){
                            console.log(config.messages.log.stakecredit8 + ' ' + stakeUser.discord_id);
                            console.log(config.messages.log.stakecredit9 + ' ' + userStakeBalance.toFixed(8));
                            console.log(config.messages.log.stakecredit10 + ' ' + userCreditAmount.toFixed(8));
                        }
                    }
                }
            }

            // Mark transactions as credited
            await transaction.transaction_update_stake_transaction_credited(highestTransactionID);

            console.log(`Credited stakes to ${creditedUsers} users`);

            // Send pool notification if configured
            if(config.bot.stakePoolChannelID && creditedUsers > 0){
                const poolFields = [
                    [config.messages.creditstakes.stakes, totalStakeAmount.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.creditstakes.amount, totalStakeForStakers.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.creditstakes.users, creditedUsers, true]
                ];

                chat.chat_reply(null,'pool',false,'DM',config.colors.success,false,config.messages.creditstakes.title,poolFields,config.messages.creditstakes.description,false,false,false,1);
            }

            if(messageFull) {
                const message = messageFull ? config.messages.creditstakes.manually : config.messages.creditstakes.cron;
                const message2 = messageFull ? config.messages.creditstakes.transactions : config.messages.creditstakes.cron2;
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,message + ' ' + stakeTransactions.length + ' ' + message2,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_credit_stakes: Error', error);
            if(messageFull) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_clear: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user has admin privileges
            if(userRole < 3){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Check if it's a DM
            if(messageType === 1){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.clear.no,false,false,false,false);
                return;
            }

            // Fetch and delete messages
            try {
                const messages = await messageFull.channel.messages.fetch({ limit: 100 });
                const deletableMessages = messages.filter(msg => 
                    (Date.now() - msg.createdTimestamp) < 1209600000 // 14 days in milliseconds
                );
                
                if(deletableMessages.size > 0){
                    await messageFull.channel.bulkDelete(deletableMessages);
                    console.log(`Cleared ${deletableMessages.size} messages from channel ${messageFull.channel.id}`);
                }
            } catch (error) {
                console.error('Failed to clear messages:', error);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_clear: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};