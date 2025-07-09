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
            var replyFields = [];
            
            // Add user commands
            if(config.commands.register)
                replyFields.push([config.messages.help.registerTitle,config.messages.help.registerValue,false]);
            if(config.commands.profile)
                replyFields.push([config.messages.help.profileTitle,config.messages.help.profileValue,false]);
            if(config.commands.balance)
                replyFields.push([config.messages.help.balanceTitle,config.messages.help.balanceValue,false]);
            if(config.commands.deposit)
                replyFields.push([config.messages.help.depositTitle,config.messages.help.depositValue,false]);
            if(config.commands.withdraw)
                replyFields.push([config.messages.help.withdrawTitle,config.messages.help.withdrawValue,false]);
            if(config.commands.tip)
                replyFields.push([config.messages.help.tipTitle,config.messages.help.tipValue,false]);
            if(config.commands.rain)
                replyFields.push([config.messages.help.rainTitle,config.messages.help.rainValue,false]);
            if(config.commands.drop)
                replyFields.push([config.messages.help.dropTitle,config.messages.help.dropValue,false]);
            if(config.commands.history)
                replyFields.push([config.messages.help.historyTitle,config.messages.help.historyValue,false]);
            if(config.commands.update)
                replyFields.push([config.messages.help.updateTitle,config.messages.help.updateValue,false]);
            if(config.commands.donate)
                replyFields.push([config.messages.help.donateTitle,config.messages.help.donateValue,false]);
            if(config.commands.stake)
                replyFields.push([config.messages.help.stakeTitle,config.messages.help.stakeValue,false]);
            if(config.commands.unstake)
                replyFields.push([config.messages.help.unstakeTitle,config.messages.help.unstakeValue,false]);
            if(config.commands.notify)
                replyFields.push([config.messages.help.notifyTitle,config.messages.help.notifyValue,false]);
            if(config.commands.version)
                replyFields.push([config.messages.help.versionTitle,config.messages.help.versionValue,false]);

            // Add admin commands if user is admin
            if(userRole >= 2) {
                replyFields.push([0,0,false]); // Spacer
                replyFields.push([config.messages.help.admin.title,'',false]);
                
                if(config.commands.startstop)
                    replyFields.push([config.messages.help.admin.startStopTitle,config.messages.help.admin.startStopValue,false]);
                if(config.commands.getdeposits)
                    replyFields.push([config.messages.help.admin.getDepositsTitle,config.messages.help.admin.getDepositsValue,false]);
                if(config.commands.creditdeposits)
                    replyFields.push([config.messages.help.admin.creditDepositsTitle,config.messages.help.admin.creditDepositsValue,false]);
                if(config.commands.getstakes)
                    replyFields.push([config.messages.help.admin.getStakesTitle,config.messages.help.admin.getStakesValue,false]);
                if(config.commands.creditstakes)
                    replyFields.push([config.messages.help.admin.creditStakesTitle,config.messages.help.admin.creditStakesValue,false]);
                if(config.commands.clear)
                    replyFields.push([config.messages.help.admin.clearTitle,config.messages.help.admin.clearValue,false]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.help.title,replyFields,false,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.register.already,false,false,false,false);
                return;
            }

            // Register user
            const userNameString = check.check_slice_string(userName.username, 25);
            const registerResult = await user.user_register(userNameString, userID);
            
            if(!registerResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log registration
            log.log_write_database(userID, config.messages.log.registered);
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user info
            const userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const userData = userInfo[0];
            const registerDate = moment(userData.register_datetime).format('YYYY-MM-DD HH:mm:ss');

            const replyFields = [
                [config.messages.profile.userid, userID, true],
                [config.messages.profile.username, userData.username, true],
                [config.messages.profile.registered, registerDate, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,replyFields,config.messages.profile.description,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const replyFields = [
                [config.messages.balance.balance, `${userBalance} ${config.wallet.coinSymbolShort}`, true],
                [config.messages.balance.username, userName.username, true]
            ];

            // Add stake balance if staking is enabled
            if(config.staking.balanceDisplay) {
                const stakeBalance = await user.user_get_stake_balance(userID);
                if(stakeBalance !== false) {
                    replyFields.push([config.messages.balance.stakeTitle, `${stakeBalance} ${config.wallet.coinSymbolShort}`, true]);
                }
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,replyFields,false,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get existing deposit address
            let depositAddress = await user.user_get_address(userID);
            
            // If no address exists, create one
            if(!depositAddress) {
                depositAddress = await wallet.wallet_create_deposit_address();
                if(!depositAddress) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                    return;
                }

                // Save address to database
                const addAddressResult = await user.user_add_deposit_address(depositAddress, userID);
                if(!addAddressResult) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Log address creation
                log.log_write_database(userID, config.messages.log.depositaddress);
            }

            const replyFields = [
                [config.messages.deposit.address, depositAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,replyFields,config.messages.deposit.description,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!withdrawAddress || !withdrawAmount) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(withdrawAmount) || Big(withdrawAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum withdrawal
            if(Big(withdrawAmount).lt(config.wallet.minWithdrawalValue)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.withdraw.min} ${config.wallet.minWithdrawalValue} ${config.wallet.coinSymbolShort}.`,false,false,false,false);
                return;
            }

            // Validate address
            const isValidAddress = await wallet.wallet_validate_address(withdrawAddress);
            if(isValidAddress === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }
            
            if(!isValidAddress) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.notvalid,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance (including fee)
            const totalAmount = Big(withdrawAmount).plus(config.wallet.transactionFee);
            if(Big(userBalance).lt(totalAmount)) {
                const maxWithdraw = Big(userBalance).minus(config.wallet.transactionFee);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.withdraw.big} ${withdrawAmount} ${config.messages.withdraw.big1} ${config.wallet.transactionFee} ${config.messages.withdraw.big2} ${totalAmount} ${config.messages.withdraw.big3} ${userBalance} ${config.messages.withdraw.big4} ${maxWithdraw > 0 ? maxWithdraw : 0} ${config.wallet.coinSymbolShort}${config.messages.withdraw.big5}`,false,false,false,false);
                return;
            }

            // Send withdrawal
            const txid = await wallet.wallet_send_to_address(withdrawAddress, withdrawAmount);
            if(!txid) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Subtract balance from user
            const subtractResult = await user.user_substract_balance(totalAmount, userID);
            if(!subtractResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
                return;
            }

            // Save withdrawal to database
            const saveResult = await transaction.transaction_save_withdrawal_to_db(userID, withdrawAddress, withdrawAmount, txid);
            if(!saveResult) {
                console.error('Failed to save withdrawal to database');
            }

            // Log withdrawal
            log.log_write_database(userID, `${config.messages.log.withdrawrequest} ${withdrawAddress}`, withdrawAmount);

            const replyFields = [
                [config.messages.withdraw.amount, `${withdrawAmount} ${config.wallet.coinSymbolShort}`, true],
                [config.messages.withdraw.address, withdrawAddress, true],
                [config.messages.withdraw.transaction, `[${txid}](${config.wallet.explorerLinkTransaction}${txid})`, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,replyFields,config.messages.withdraw.description,false,false,false,false);
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
            if(messageType === 1) { // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.private,false,false,false,false);
                return;
            }

            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!tipUser || !tipAmount) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate Discord ID format
            if(!check.check_valid_discord_id(tipUser)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.notvalid,false,false,false,false);
                return;
            }

            // Extract user ID from mention
            const tipUserID = tipUser.replace(/[<@!>]/g, '');

            // Check if trying to tip self
            if(tipUserID === userID) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.self,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(tipAmount) || Big(tipAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum tip
            if(Big(tipAmount).lt(config.wallet.minTipValue)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.tip.min} ${config.wallet.minTipValue} ${config.wallet.coinSymbolShort}.`,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(tipAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.tip.big} ${tipAmount} ${config.messages.tip.big1} ${userBalance} ${config.messages.tip.big2}`,false,false,false,false);
                return;
            }

            // Check if tip recipient is registered
            const recipientRegistered = await user.user_registered_check(tipUserID);
            if(recipientRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!recipientRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.no,false,false,false,false);
                return;
            }

            // Process tip
            const subtractResult = await user.user_substract_balance(tipAmount, userID);
            const addResult = await user.user_add_balance(tipAmount, tipUserID);

            if(!subtractResult || !addResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Save payment to database
            await transaction.transaction_save_payment_to_db(tipAmount, userID, tipUserID, config.messages.payment.tip.send);

            // Log tip
            log.log_write_database(userID, `${config.messages.log.tip} ${tipUserID}`, tipAmount);

            const replyFields = [
                [config.messages.tip.amount, `${tipAmount} ${config.wallet.coinSymbolShort}`, true],
                [config.messages.tip.user, tipUser, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.tip.title,replyFields,config.messages.tip.description,false,false,false,false);
        } catch (error) {
            console.error('command_tip: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Rain command
    /* ------------------------------------------------------------------------------ */

    command_rain: async function(messageFull,userID,userName,messageType,userRole,rainType,rainAmount,rainUserCount,serverUsers,activeUsers){
        try {
            // Check if private message
            if(messageType === 1) { // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.private,false,false,false,false);
                return;
            }

            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!rainType || !rainAmount) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(rainAmount) || Big(rainAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(rainAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.rain.big} ${rainAmount} ${config.messages.rain.big1} ${userBalance} ${config.messages.rain.big2}`,false,false,false,false);
                return;
            }

            let targetUsers = [];
            let userCount = 0;

            if(rainType === 'all') {
                // Rain to all registered users
                const totalUsers = await user.user_get_total_count();
                if(!totalUsers || totalUsers.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                userCount = totalUsers[0].totalusers;
                
                // Calculate amount per user
                const amountPerUser = Big(rainAmount).div(userCount);
                
                // Check minimum amount per user
                if(amountPerUser.lt(config.wallet.minTipValue)) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.rain.minimum} ${config.wallet.minTipValue} ${config.messages.rain.minimum1} ${userCount} ${config.messages.rain.minimum2}`,false,false,false,false);
                    return;
                }

                // Process rain to all users
                const subtractResult = await user.user_substract_balance(rainAmount, userID);
                const addResult = await user.user_add_balance_all(amountPerUser);

                if(!subtractResult || !addResult) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Save payment to database
                await transaction.transaction_save_payment_to_db(rainAmount, userID, 'rainall', config.messages.payment.tip.send);

                // Log rain
                log.log_write_database(userID, `${config.messages.log.rain} ${userCount} ${config.messages.log.rain1}`, rainAmount);

                const replyFields = [
                    [config.messages.rain.amount, `${rainAmount} ${config.wallet.coinSymbolShort}`, true],
                    [config.messages.rain.users, userCount, true],
                    [config.messages.rain.each, `${amountPerUser} ${config.wallet.coinSymbolShort}`, true]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);

            } else if(rainType === 'random') {
                // Validate user count
                if(!rainUserCount || !check.check_isNumeric(rainUserCount) || parseInt(rainUserCount) <= 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }

                const requestedCount = parseInt(rainUserCount);
                
                // Check maximum random users
                if(requestedCount > config.wallet.maxRainRandomUsers) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.rain.randommax} ${config.wallet.maxRainRandomUsers} ${config.messages.rain.randommax1}`,false,false,false,false);
                    return;
                }

                // Get random users
                const randomUsers = await user.user_get_discord_ids(requestedCount);
                if(!randomUsers || randomUsers.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                userCount = randomUsers.length;
                const amountPerUser = Big(rainAmount).div(userCount);

                // Check minimum amount per user
                if(amountPerUser.lt(config.wallet.minTipValue)) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.rain.minimum} ${config.wallet.minTipValue} ${config.messages.rain.minimum1} ${userCount} ${config.messages.rain.minimum2}`,false,false,false,false);
                    return;
                }

                // Process rain
                const subtractResult = await user.user_substract_balance(rainAmount, userID);
                if(!subtractResult) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Add balance to each random user
                for(const randomUser of randomUsers) {
                    await user.user_add_balance(amountPerUser, randomUser.discord_id);
                    await transaction.transaction_save_payment_to_db(amountPerUser, userID, randomUser.discord_id, config.messages.payment.tip.send);
                }

                // Log rain
                log.log_write_database(userID, `${config.messages.log.rain} ${userCount} ${config.messages.log.rain1}`, rainAmount);

                const replyFields = [
                    [config.messages.rain.amount, `${rainAmount} ${config.wallet.coinSymbolShort}`, true],
                    [config.messages.rain.users, userCount, true],
                    [config.messages.rain.each, `${amountPerUser} ${config.wallet.coinSymbolShort}`, true]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            }
        } catch (error) {
            console.error('command_rain: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Drop command
    /* ------------------------------------------------------------------------------ */

    command_drop: async function(messageFull,userID,userName,messageType,userRole,dropType,dropAmount,dropTime,dropPhrase){
        try {
            // Check if private message
            if(messageType === 1) { // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.private,false,false,false,false);
                return;
            }

            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!dropType || !dropAmount || !dropTime) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(dropAmount) || Big(dropAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum drop value
            if(Big(dropAmount).lt(config.bot.minDropValue)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.drop.min} ${config.bot.minDropValue} ${config.wallet.coinSymbolShort}.`,false,false,false,false);
                return;
            }

            // Validate time
            if(!check.check_isNumeric(dropTime) || parseInt(dropTime) < config.bot.dropMinSeconds || parseInt(dropTime) > config.bot.dropMaxSeconds) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.drop.minTime} ${config.bot.dropMinSeconds}. ${config.messages.drop.maxTime} ${config.bot.dropMaxSeconds}.`,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(dropAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.drop.big} ${dropAmount} ${config.messages.drop.big1} ${userBalance} ${config.messages.drop.big2}`,false,false,false,false);
                return;
            }

            if(dropType === 'phrase') {
                // Validate phrase
                if(!dropPhrase || dropPhrase.length < 3) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }

                const replyFields = [
                    [config.messages.drop.phrase, dropPhrase, false],
                    [config.messages.drop.amount, `${dropAmount} ${config.wallet.coinSymbolShort}`, true],
                    [config.messages.drop.seconds, dropTime, true]
                ];

                const dropMessage = await chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropPhraseReply,false,false,false,false);

                // Store drop data for processing
                storage.storage_write_local_storage(userID, 'drop', {
                    type: 'phrase',
                    amount: dropAmount,
                    phrase: dropPhrase,
                    messageId: dropMessage.id,
                    channelId: messageFull.channel.id,
                    participants: []
                });

                // Set timeout for drop completion
                setTimeout(async () => {
                    await this.process_drop_completion(userID);
                }, parseInt(dropTime) * 1000);

            } else if(dropType === 'react') {
                const replyFields = [
                    [config.messages.drop.icon, config.bot.dropReactIcon, false],
                    [config.messages.drop.amount, `${dropAmount} ${config.wallet.coinSymbolShort}`, true],
                    [config.messages.drop.seconds, dropTime, true]
                ];

                const dropMessage = await chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropReactReply,false,false,false,false);

                // Add reaction to the message
                try {
                    await dropMessage.react(config.bot.dropReactIcon);
                } catch (error) {
                    console.error('Failed to add reaction:', error);
                }

                // Store drop data for processing
                storage.storage_write_local_storage(userID, 'drop', {
                    type: 'react',
                    amount: dropAmount,
                    messageId: dropMessage.id,
                    channelId: messageFull.channel.id,
                    participants: []
                });

                // Set timeout for drop completion
                setTimeout(async () => {
                    await this.process_drop_completion(userID);
                }, parseInt(dropTime) * 1000);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            }
        } catch (error) {
            console.error('command_drop: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process drop completion
    /* ------------------------------------------------------------------------------ */

    process_drop_completion: async function(userID){
        try {
            const dropData = storage.storage_read_local_storage(userID, 'drop');
            if(!dropData) return;

            const participantCount = dropData.participants.length;
            
            // Check minimum participants
            if(participantCount < config.bot.dropMinUsers) {
                // Send failure message
                const channel = globalClient.channels.cache.get(dropData.channelId);
                if(channel) {
                    const replyFields = [
                        [config.messages.drop.minFailedUser, `${participantCount} ${config.messages.drop.minFailedUser1} ${config.bot.dropMinUsers} ${config.messages.drop.minFailedUser2}`, false]
                    ];
                    
                    await channel.send({embeds: [chat.chat_build_reply('embed', false, 'guild', config.colors.error, false, config.messages.drop.minFailedUserTitle, replyFields, false, false, false, false, false)]});
                }
                
                storage.storage_delete_local_storage(userID, 'drop');
                return;
            }

            // Calculate amount per participant
            const amountPerUser = Big(dropData.amount).div(participantCount);

            // Process drop payments
            const subtractResult = await user.user_substract_balance(dropData.amount, userID);
            if(!subtractResult) {
                console.error('Failed to subtract balance for drop');
                storage.storage_delete_local_storage(userID, 'drop');
                return;
            }

            // Add balance to each participant
            for(const participantId of dropData.participants) {
                await user.user_add_balance(amountPerUser, participantId);
                await transaction.transaction_save_payment_to_db(amountPerUser, userID, participantId, config.messages.payment.drop.send);
            }

            // Log drop
            log.log_write_database(userID, `${config.messages.log.drop} ${participantCount} ${config.messages.log.drop1}`, dropData.amount);

            // Send completion message
            const channel = globalClient.channels.cache.get(dropData.channelId);
            if(channel) {
                const replyFields = [
                    [config.messages.drop.amount, `${dropData.amount} ${config.wallet.coinSymbolShort}`, true],
                    [config.messages.drop.users, participantCount, true],
                    [config.messages.drop.each, `${amountPerUser} ${config.wallet.coinSymbolShort}`, true]
                ];
                
                await channel.send({embeds: [chat.chat_build_reply('embed', false, 'guild', config.colors.success, false, config.messages.drop.titleSent, replyFields, config.messages.drop.description, false, false, false, false)]});
            }

            // Clean up
            storage.storage_delete_local_storage(userID, 'drop');
        } catch (error) {
            console.error('process_drop_completion: Error', error);
            storage.storage_delete_local_storage(userID, 'drop');
        }
    },

    /* ------------------------------------------------------------------------------ */
    // History command
    /* ------------------------------------------------------------------------------ */

    command_history: async function(messageFull,userID,userName,messageType,userRole,historyType){
        try {
            // Check if user is registered
            const isRegistered = await user.user_registered_check(userID);
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            if(!historyType) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            if(historyType === 'deposits' || historyType === 'd') {
                // Get user deposit address
                const depositAddress = await user.user_get_address(userID);
                if(!depositAddress) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                // Get deposit history
                const deposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory, depositAddress);
                if(!deposits || deposits.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                const replyFields = [];
                for(const deposit of deposits) {
                    const status = deposit.credited ? config.messages.history.deposits.credited : config.messages.history.deposits.pending;
                    const explorerLink = `[${config.messages.history.deposits.view}](${config.wallet.explorerLinkTransaction}${deposit.txid})`;
                    
                    replyFields.push([`${deposit.amount} ${config.wallet.coinSymbolShort}`, `${config.messages.history.deposits.status}: ${status}\n${config.messages.history.deposits.confirmations}: ${deposit.confirmations}\n${explorerLink}`, false]);
                }

                const description = `${config.messages.history.deposits.description} ${config.wallet.minConfirmationsCredit} ${config.messages.history.deposits.description1} ${config.wallet.depositsConfirmationTime} ${config.messages.history.deposits.description2}`;

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,replyFields,description,false,false,false,false);

            } else if(historyType === 'withdrawals' || historyType === 'w') {
                // Get withdrawal history
                const withdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount, userID);
                if(!withdrawals || withdrawals.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                    return;
                }

                const replyFields = [];
                for(const withdrawal of withdrawals) {
                    const explorerLink = `[${config.messages.history.deposits.view}](${config.wallet.explorerLinkTransaction}${withdrawal.txid})`;
                    const addressLink = `[${withdrawal.address}](${config.wallet.explorerLinkAddress}${withdrawal.address})`;
                    
                    replyFields.push([`${withdrawal.amount} ${config.wallet.coinSymbolShort}`, `${addressLink}\n${explorerLink}`, false]);
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,replyFields,config.messages.history.withdrawals.description,false,false,false,false);

            } else if(historyType === 'payments' || historyType === 'p') {
                // Get payment history
                const payments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun, userID);
                if(!payments || payments.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                    return;
                }

                const replyFields = [];
                for(const payment of payments) {
                    const direction = payment.from_discord_id === userID ? '→' : '←';
                    const otherUser = payment.from_discord_id === userID ? payment.to_discord_id : payment.from_discord_id;
                    
                    replyFields.push([`${direction} ${payment.amount} ${config.wallet.coinSymbolShort}`, `${config.messages.history.payments.type}: ${payment.type}\nUser: <@${otherUser}>`, false]);
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,replyFields,config.messages.history.payments.description,false,false,false,false);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Update username
            const userNameString = check.check_slice_string(userName.username, 25);
            const updateResult = await user.user_update_username(userNameString, userID);
            
            if(!updateResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log update
            log.log_write_database(userID, `${config.messages.log.username} ${userNameString}`);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,false);
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
            const replyFields = [
                [config.messages.donate.address, config.wallet.donateAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,replyFields,config.messages.donate.description,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate amount
            if(!stakeAmount || !check.check_isNumeric(stakeAmount) || Big(stakeAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum stake
            if(Big(stakeAmount).lt(config.staking.minStake)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.stake.min} ${config.staking.minStake} ${config.wallet.coinSymbolShort}.`,false,false,false,false);
                return;
            }

            // Get user balance
            const userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(stakeAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.stake.big} ${stakeAmount} ${config.messages.stake.big1} ${userBalance} ${config.messages.stake.big2}`,false,false,false,false);
                return;
            }

            // Process stake
            const currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            
            const subtractResult = await user.user_substract_balance(stakeAmount, userID);
            const addStakeResult = await user.user_add_stake_balance(stakeAmount, userID, currentDatetime);

            if(!subtractResult || !addStakeResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log stake
            log.log_write_database(userID, config.messages.log.stake, stakeAmount);

            const replyFields = [
                [config.messages.stake.amount, `${stakeAmount} ${config.wallet.coinSymbolShort}`, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.stake.title,replyFields,config.messages.stake.description,false,false,false,false);
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
            if(isRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!isRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate amount
            if(!unstakeAmount || !check.check_isNumeric(unstakeAmount) || Big(unstakeAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum unstake
            if(Big(unstakeAmount).lt(config.staking.minUnstake)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.unstake.min} ${config.staking.minUnstake} ${config.wallet.coinSymbolShort}.`,false,false,false,false);
                return;
            }

            // Get user info to check lock time
            const userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            const userData = userInfo[0];
            const currentTime = moment().tz(config.staking.timezone);
            const lastUnstakeTime = moment(userData.unstake_datetime).tz(config.staking.timezone);
            const timeDiff = currentTime.diff(lastUnstakeTime, 'seconds');

            // Check lock time
            if(timeDiff < config.staking.lockTime) {
                const remainingTime = config.staking.lockTime - timeDiff;
                const days = Math.floor(remainingTime / 86400);
                const hours = Math.floor((remainingTime % 86400) / 3600);
                const minutes = Math.floor((remainingTime % 3600) / 60);
                const seconds = remainingTime % 60;

                let timeString = '';
                if(days > 0) timeString += `${days} ${config.messages.unstake.leftdays} `;
                if(hours > 0) timeString += `${hours} ${config.messages.unstake.lefthours} `;
                if(minutes > 0) timeString += `${minutes} ${config.messages.unstake.leftminutes} `;
                if(seconds > 0) timeString += `${seconds} ${config.messages.unstake.leftseconds}`;

                const replyFields = [
                    [config.messages.unstake.locked, `${config.messages.unstake.left} ${timeString.trim()} ${config.messages.unstake.left2}`, false]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,replyFields,false,false,false,false,false);
                return;
            }

            // Get user stake balance
            const stakeBalance = await user.user_get_stake_balance(userID);
            if(stakeBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough stake balance
            if(Big(stakeBalance).lt(unstakeAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,`${config.messages.unstake.big} ${unstakeAmount} ${config.messages.unstake.big1} ${stakeBalance} ${config.messages.unstake.big2}`,false,false,false,false);
                return;
            }

            // Check if remaining balance would be below minimum
            const remainingStake = Big(stakeBalance).minus(unstakeAmount);
            let actualUnstakeAmount = unstakeAmount;

            if(remainingStake.gt(0) && remainingStake.lt(config.staking.minStake)) {
                // Unstake everything if remaining would be below minimum
                actualUnstakeAmount = stakeBalance;
                
                const replyFields = [
                    [config.messages.unstake.amount, `${actualUnstakeAmount} ${config.wallet.coinSymbolShort}`, true]
                ];

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,replyFields,`${config.messages.unstake.rest} ${remainingStake} ${config.messages.unstake.rest2} ${config.staking.minStake} ${config.messages.unstake.rest3}`,false,false,false,false);
            }

            // Process unstake
            const currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            
            const subtractStakeResult = await user.user_substract_stake_balance(actualUnstakeAmount, userID, currentDatetime);
            const addBalanceResult = await user.user_add_balance(actualUnstakeAmount, userID);

            if(!subtractStakeResult || !addBalanceResult) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log unstake
            log.log_write_database(userID, config.messages.log.unstake, actualUnstakeAmount);

            const replyFields = [
                [config.messages.unstake.amount, `${actualUnstakeAmount} ${config.wallet.coinSymbolShort}`, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.unstake.title,replyFields,config.messages.unstake.description,false,false,false,false);
        } catch (error) {
            console.error('command_unstake: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Notify command
    /* ------------------------------------------------------------------------------ */

    command_notify: function(messageFull,userID,userName,messageType,userRole,notifyOption){
        try {
            if(!notifyOption || (notifyOption !== 'on' && notifyOption !== 'off')) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Store notification preference
            storage.storage_write_local_storage(userID, 'notifications', notifyOption === 'on');

            const message = notifyOption === 'on' ? config.messages.notify.enabled : config.messages.notify.disabled;
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,message,false,false,false,false);
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
            if(walletInfo === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            const replyFields = [
                [config.messages.version.botversion, config.bot.version, true],
                [config.messages.version.walletversion, walletInfo.version || 'Unknown', true],
                [config.messages.version.walletprotocolversion, walletInfo.protocolversion || 'Unknown', true],
                [config.messages.version.walletconnections, walletInfo.connections || 0, true],
                [config.messages.version.walletblocks, walletInfo.blocks || 0, true],
                [config.messages.version.walletdifficulty, walletInfo.difficulty || 0, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,replyFields,false,false,false,false,false);
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
            // Check admin permissions
            if(userRole < 2) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            const result = await this.process_get_deposits();
            
            if(result.success) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,`${config.messages.getdeposits.manually} ${result.count} ${config.messages.getdeposits.deposits}.`,false,false,false,false);
            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            }
        } catch (error) {
            console.error('command_get_deposits: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process get deposits
    /* ------------------------------------------------------------------------------ */

    process_get_deposits: async function(){
        try {
            // Get latest deposits from wallet
            const deposits = await wallet.wallet_get_latest_deposits();
            if(!deposits) {
                return { success: false, count: 0 };
            }

            let processedCount = 0;

            for(const deposit of deposits) {
                // Only process receive transactions
                if(deposit.category === 'receive' && deposit.address && deposit.amount > 0) {
                    const result = await transaction.transaction_add_update_deposits_on_db(
                        deposit.address,
                        deposit.amount,
                        deposit.confirmations,
                        deposit.txid
                    );
                    
                    if(result) {
                        processedCount++;
                    }
                }
            }

            console.log(`Processed ${processedCount} deposits`);
            return { success: true, count: processedCount };
        } catch (error) {
            console.error('process_get_deposits: Error', error);
            return { success: false, count: 0 };
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit deposits command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check admin permissions
            if(userRole < 2) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            const result = await this.process_credit_deposits();
            
            if(result.success) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,`${config.messages.creditdeposits.manually} ${result.count} ${config.messages.creditdeposits.deposits}.`,false,false,false,false);
            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        } catch (error) {
            console.error('command_credit_deposits: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process credit deposits
    /* ------------------------------------------------------------------------------ */

    process_credit_deposits: async function(){
        try {
            // Get confirmed deposits
            const deposits = await transaction.transaction_get_confirmed_deposits();
            if(!deposits || deposits.length === 0) {
                return { success: true, count: 0 };
            }

            let creditedCount = 0;

            for(const deposit of deposits) {
                // Get user ID by address
                const userID = await user.user_get_id_by_address(deposit.address);
                
                if(userID && userID !== 'notregisteredaddress') {
                    // Credit balance to user
                    const creditResult = await user.user_credit_balance(deposit.address, deposit.amount);
                    
                    if(creditResult) {
                        // Mark deposit as credited
                        const markResult = await transaction.transaction_set_deposit_confirmed(deposit.id);
                        
                        if(markResult) {
                            // Log credit
                            log.log_write_database(userID, `${config.messages.log.transctioncredited} ${deposit.address}`, deposit.amount);
                            creditedCount++;
                        }
                    }
                } else {
                    // Unknown address, still mark as credited to avoid reprocessing
                    await transaction.transaction_set_deposit_confirmed(deposit.id);
                    log.log_write_database('unknown', `${config.messages.log.transctioncreditedunknown} ${deposit.address}`, deposit.amount);
                }
            }

            console.log(`Credited ${creditedCount} deposits`);
            return { success: true, count: creditedCount };
        } catch (error) {
            console.error('process_credit_deposits: Error', error);
            return { success: false, count: 0 };
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get stakes command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check admin permissions
            if(userRole < 2) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            const result = await this.process_get_stakes();
            
            if(result.success) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,`${config.messages.getstakes.manually} ${result.count} ${config.messages.getstakes.transactions}.`,false,false,false,false);
            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        } catch (error) {
            console.error('command_get_stakes: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process get stakes
    /* ------------------------------------------------------------------------------ */

    process_get_stakes: async function(){
        try {
            // Get unchecked transactions
            const transactions = await transaction.transaction_get_stake_transactions();
            if(!transactions || transactions.length === 0) {
                return { success: true, count: 0 };
            }

            let processedCount = 0;

            for(const tx of transactions) {
                try {
                    // Get transaction details
                    const txDetails = await wallet.wallet_get_transaction(tx.txid);
                    if(!txDetails) continue;

                    let isStake = false;
                    let stakeAmount = 0;

                    // Calculate stake reward based on wallet mode
                    const reward = await wallet.wallet_calculate_stake_reward(txDetails);
                    
                    if(reward !== null && reward > 0) {
                        isStake = true;
                        stakeAmount = reward;
                        
                        if(config.staking.debug) {
                            console.log(`Stake found: ${tx.txid} - Reward: ${reward}`);
                        }
                    }

                    // Update transaction in database
                    const updateResult = await transaction.transaction_update_stake_transaction(
                        tx.txid,
                        stakeAmount,
                        isStake ? 1 : 0
                    );

                    if(updateResult) {
                        processedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing transaction ${tx.txid}:`, error);
                    // Mark as checked even if error to avoid reprocessing
                    await transaction.transaction_update_stake_transaction(tx.txid, 0, 0);
                }
            }

            console.log(`Processed ${processedCount} stake transactions`);
            return { success: true, count: processedCount };
        } catch (error) {
            console.error('process_get_stakes: Error', error);
            return { success: false, count: 0 };
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit stakes command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check admin permissions
            if(userRole < 2) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            const result = await this.process_credit_stakes();
            
            if(result.success) {
                if(result.count > 0) {
                    // Send pool payout notification
                    const replyFields = [
                        [config.messages.creditstakes.stakes, result.count, true],
                        [config.messages.creditstakes.amount, `${result.totalAmount} ${config.wallet.coinSymbolShort}`, true],
                        [config.messages.creditstakes.users, result.userCount, true]
                    ];

                    chat.chat_reply(messageFull,'pool',false,'guild',config.colors.success,false,config.messages.creditstakes.title,replyFields,config.messages.creditstakes.description,false,false,false,false);
                }
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,`${config.messages.creditstakes.manually} ${result.count} ${config.messages.creditstakes.transactions}.`,false,false,false,false);
            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        } catch (error) {
            console.error('command_credit_stakes: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Process credit stakes
    /* ------------------------------------------------------------------------------ */

    process_credit_stakes: async function(){
        try {
            // Get stake transactions to credit
            const stakeTransactions = await transaction.transaction_get_stake_transactions_to_credit();
            if(!stakeTransactions || stakeTransactions.length === 0) {
                return { success: true, count: 0, totalAmount: 0, userCount: 0 };
            }

            // Get wallet balance for calculations
            const walletBalance = await wallet.wallet_get_balance();
            if(walletBalance === false) {
                return { success: false, count: 0, totalAmount: 0, userCount: 0 };
            }

            // Get all stake users
            const stakeUsers = await user.user_get_stake_users();
            if(!stakeUsers || stakeUsers.length === 0) {
                return { success: true, count: 0, totalAmount: 0, userCount: 0 };
            }

            // Calculate total stake amount
            let totalStakeAmount = Big(0);
            for(const stakeUser of stakeUsers) {
                totalStakeAmount = totalStakeAmount.plus(stakeUser.stake_balance);
            }

            // Calculate total reward amount
            let totalRewardAmount = Big(0);
            for(const stakeTx of stakeTransactions) {
                totalRewardAmount = totalRewardAmount.plus(stakeTx.amount);
            }

            // Calculate amount for stakers (minus owner percentage)
            const ownerPercentage = Big(config.staking.ownerPercentage).div(100);
            const stakersAmount = totalRewardAmount.times(Big(1).minus(ownerPercentage));

            if(config.staking.debug) {
                console.log(`${config.messages.log.stakecredit} ${walletBalance}`);
                console.log(`${config.messages.log.stakecredit1} ${totalRewardAmount}`);
                console.log(`${config.messages.log.stakecredit2} ${stakersAmount}`);
                console.log(`${config.messages.log.stakecredit3} ${stakeUsers.length}`);
                console.log(`${config.messages.log.stakecredit5} ${totalStakeAmount}`);
            }

            // Credit each user proportionally
            let creditedUsers = 0;
            for(const stakeUser of stakeUsers) {
                const userStakeBalance = Big(stakeUser.stake_balance);
                const userProportion = userStakeBalance.div(totalStakeAmount);
                const userReward = stakersAmount.times(userProportion);

                if(userReward.gt(0)) {
                    const addResult = await user.user_add_balance(userReward, stakeUser.discord_id);
                    if(addResult) {
                        // Save payment record
                        await transaction.transaction_save_payment_to_db(userReward, config.bot.botID, stakeUser.discord_id, config.messages.payment.stake.received);
                        
                        // Log stake credit
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit8 + ' ' + stakeUser.discord_id, userReward);
                        
                        creditedUsers++;
                        
                        if(config.staking.debug) {
                            console.log(`${config.messages.log.stakecredit8} ${stakeUser.discord_id}`);
                            console.log(`${config.messages.log.stakecredit9} ${userStakeBalance}`);
                            console.log(`${config.messages.log.stakecredit10} ${userReward}`);
                        }
                    }
                }
            }

            // Mark transactions as credited
            if(stakeTransactions.length > 0) {
                const highestId = Math.max(...stakeTransactions.map(tx => tx.id));
                await transaction.transaction_update_stake_transaction_credited(highestId);
            }

            console.log(`Credited stakes to ${creditedUsers} users, total amount: ${stakersAmount}`);
            return { 
                success: true, 
                count: stakeTransactions.length, 
                totalAmount: stakersAmount.toString(),
                userCount: creditedUsers 
            };
        } catch (error) {
            console.error('process_credit_stakes: Error', error);
            return { success: false, count: 0, totalAmount: 0, userCount: 0 };
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear command (Admin)
    /* ------------------------------------------------------------------------------ */

    command_clear: function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check admin permissions
            if(userRole < 2) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Check if private message
            if(messageType === 1) { // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.clear.no,false,false,false,false);
                return;
            }

            // Delete the command message
            messageFull.delete().catch(console.error);
            
            // Note: Bulk message deletion would require additional permissions and implementation
            // This is a basic implementation that just deletes the command message
        } catch (error) {
            console.error('command_clear: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};