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

var chat = require("./chat.js");
var check = require("./check.js");
var user = require("./user.js");
var wallet = require("./wallet.js");
var transaction = require("./transaction.js");
var storage = require("./storage.js");
var log = require("./log.js");

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Fire command
    /* ------------------------------------------------------------------------------ */

    fire_command: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        try {
            // Check if command is enabled in config
            if(!config.commands[commandOne]){
                console.log(`Command ${commandOne} is disabled in config`);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Check if user is currently blocked (prevent multiple simultaneous commands)
            var userBlocked = storage.storage_read_local_storage(userID,'blocked');
            if(userBlocked){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
                return;
            }

            // Block user for command processing
            storage.storage_write_local_storage(userID,'blocked',true);

            // Process commands based on commandOne
            switch(commandOne) {
                case 'help':
                case 'h':
                    await this.command_help(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'register':
                case 'r':
                    await this.command_register(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'profile':
                case 'p':
                    await this.command_profile(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'balance':
                case 'b':
                    await this.command_balance(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'deposit':
                case 'd':
                    await this.command_deposit(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'withdraw':
                case 'w':
                    await this.command_withdraw(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'tip':
                    await this.command_tip(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'rain':
                    await this.command_rain(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,serverUsers,activeUsers);
                    break;
                case 'drop':
                    await this.command_drop(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,commandFive);
                    break;
                case 'history':
                    await this.command_history(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'update':
                case 'u':
                    await this.command_update(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'donate':
                    await this.command_donate(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'stake':
                    await this.command_stake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'unstake':
                    await this.command_unstake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'notify':
                    await this.command_notify(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'version':
                case 'v':
                    await this.command_version(messageFull,userID,userName,messageType,userRole);
                    break;
                // Admin commands
                case 'getdeposits':
                case 'gd':
                    if(userRole >= 3) {
                        await this.command_get_deposits(messageFull,userID,userName,messageType,userRole,1);
                    } else {
                        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                    }
                    break;
                case 'creditdeposits':
                case 'cd':
                    if(userRole >= 3) {
                        await this.command_credit_deposits(messageFull,userID,userName,messageType,userRole,1);
                    } else {
                        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                    }
                    break;
                case 'getstakes':
                case 'gs':
                    if(userRole >= 3) {
                        await this.command_get_stakes(messageFull,userID,userName,messageType,userRole,1);
                    } else {
                        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                    }
                    break;
                case 'creditstakes':
                case 'cs':
                    if(userRole >= 3) {
                        await this.command_credit_stakes(messageFull,userID,userName,messageType,userRole,1);
                    } else {
                        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                    }
                    break;
                case 'clear':
                case 'c':
                    if(userRole >= 3) {
                        await this.command_clear(messageFull,userID,userName,messageType,userRole);
                    } else {
                        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                    }
                    break;
                default:
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    break;
            }

        } catch (error) {
            console.error('fire_command: Error processing command', commandOne);
            console.error(error);
            
            // Log error and respond to user
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        } finally {
            // Always unblock user after command processing
            storage.storage_delete_local_storage(userID,'blocked');
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Help command
    /* ------------------------------------------------------------------------------ */

    command_help: async function(messageFull,userID,userName,messageType,userRole){
        try {
            var replyFields = [];
            
            // Add normal user commands
            if(config.commands.register) {
                replyFields.push([config.messages.help.registerTitle, config.messages.help.registerValue, false]);
            }
            if(config.commands.profile) {
                replyFields.push([config.messages.help.profileTitle, config.messages.help.profileValue, false]);
            }
            if(config.commands.balance) {
                replyFields.push([config.messages.help.balanceTitle, config.messages.help.balanceValue, false]);
            }
            if(config.commands.deposit) {
                replyFields.push([config.messages.help.depositTitle, config.messages.help.depositValue, false]);
            }
            if(config.commands.withdraw) {
                replyFields.push([config.messages.help.withdrawTitle, config.messages.help.withdrawValue, false]);
            }
            if(config.commands.tip) {
                replyFields.push([config.messages.help.tipTitle, config.messages.help.tipValue, false]);
            }
            if(config.commands.rain) {
                replyFields.push([config.messages.help.rainTitle, config.messages.help.rainValue, false]);
            }
            if(config.commands.drop) {
                replyFields.push([config.messages.help.dropTitle, config.messages.help.dropValue, false]);
            }
            if(config.commands.history) {
                replyFields.push([config.messages.help.historyTitle, config.messages.help.historyValue, false]);
            }
            if(config.commands.stake) {
                replyFields.push([config.messages.help.stakeTitle, config.messages.help.stakeValue, false]);
            }
            if(config.commands.unstake) {
                replyFields.push([config.messages.help.unstakeTitle, config.messages.help.unstakeValue, false]);
            }
            if(config.commands.update) {
                replyFields.push([config.messages.help.updateTitle, config.messages.help.updateValue, false]);
            }
            if(config.commands.donate) {
                replyFields.push([config.messages.help.donateTitle, config.messages.help.donateValue, false]);
            }
            if(config.commands.notify) {
                replyFields.push([config.messages.help.notifyTitle, config.messages.help.notifyValue, false]);
            }
            if(config.commands.version) {
                replyFields.push([config.messages.help.versionTitle, config.messages.help.versionValue, false]);
            }

            // Add admin commands if user is admin
            if(userRole >= 3) {
                replyFields.push([0, 0, false]); // Spacer
                replyFields.push([config.messages.help.admin.title, "** **", false]);
                
                if(config.commands.startstop) {
                    replyFields.push([config.messages.help.admin.startStopTitle, config.messages.help.admin.startStopValue, false]);
                }
                if(config.commands.getdeposits) {
                    replyFields.push([config.messages.help.admin.getDepositsTitle, config.messages.help.admin.getDepositsValue, false]);
                }
                if(config.commands.creditdeposits) {
                    replyFields.push([config.messages.help.admin.creditDepositsTitle, config.messages.help.admin.creditDepositsValue, false]);
                }
                if(config.commands.getstakes) {
                    replyFields.push([config.messages.help.admin.getStakesTitle, config.messages.help.admin.getStakesValue, false]);
                }
                if(config.commands.creditstakes) {
                    replyFields.push([config.messages.help.admin.creditStakesTitle, config.messages.help.admin.creditStakesValue, false]);
                }
                if(config.commands.clear) {
                    replyFields.push([config.messages.help.admin.clearTitle, config.messages.help.admin.clearValue, false]);
                }
            }

            chat.chat_reply(messageFull,'embed',false,messageType,config.colors.normal,false,config.messages.help.title,replyFields,false,false,false,false,false);
            
        } catch (error) {
            console.error('command_help: Error processing help command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Register command
    /* ------------------------------------------------------------------------------ */

    command_register: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is already registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.register.already,false,false,false,false);
                return;
            }

            // Register user
            var userNameString = check.check_slice_string(userName.username, 25);
            var registerUser = await user.user_register(userNameString, userID);
            
            if(!registerUser) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log registration
            log.log_write_database(userID, config.messages.log.registered);
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,false);
            
        } catch (error) {
            console.error('command_register: Error processing register command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Profile command
    /* ------------------------------------------------------------------------------ */

    command_profile: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user info
            var userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var userData = userInfo[0];
            var replyFields = [
                [config.messages.profile.userid, userID, true],
                [config.messages.profile.username, userData.username, true],
                [config.messages.profile.registered, moment(userData.register_datetime).format('YYYY-MM-DD HH:mm:ss'), true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,replyFields,config.messages.profile.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_profile: Error processing profile command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Balance command
    /* ------------------------------------------------------------------------------ */

    command_balance: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [
                [config.messages.balance.balance, userBalance + ' ' + config.wallet.coinSymbolShort, true]
            ];

            // Add stake balance if staking is enabled
            if(config.staking.balanceDisplay) {
                var userStakeBalance = await user.user_get_stake_balance(userID);
                if(userStakeBalance !== false) {
                    replyFields.push([config.messages.balance.stakeTitle, userStakeBalance + ' ' + config.wallet.coinSymbolShort, true]);
                }
            }

            // Get user info for username
            var userInfo = await user.user_get_info(userID);
            if(userInfo && userInfo.length > 0) {
                replyFields.push([config.messages.balance.username, userInfo[0].username, true]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,replyFields,false,false,false,false,false);
            
        } catch (error) {
            console.error('command_balance: Error processing balance command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Deposit command
    /* ------------------------------------------------------------------------------ */

    command_deposit: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Get user deposit address
            var userAddress = await user.user_get_address(userID);
            if(userAddress === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // If no address exists, create one
            if(!userAddress) {
                var newAddress = await wallet.wallet_create_deposit_address();
                if(!newAddress) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                    return;
                }

                // Save address to database
                var saveAddress = await user.user_add_deposit_address(newAddress, userID);
                if(!saveAddress) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                userAddress = newAddress;
                log.log_write_database(userID, config.messages.log.depositaddress + ' ' + userAddress);
            }

            var replyFields = [
                [config.messages.deposit.address, userAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,replyFields,config.messages.deposit.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_deposit: Error processing deposit command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Withdraw command
    /* ------------------------------------------------------------------------------ */

    command_withdraw: async function(messageFull,userID,userName,messageType,userRole,withdrawAddress,withdrawAmount){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.min + ' ' + config.wallet.minWithdrawalValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
                return;
            }

            // Validate address
            var addressValid = await wallet.wallet_validate_address(withdrawAddress);
            if(addressValid === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }
            
            if(!addressValid) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.notvalid,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance (including fee)
            var totalAmount = Big(withdrawAmount).plus(config.wallet.transactionFee);
            if(Big(userBalance).lt(totalAmount)) {
                var maxWithdraw = Big(userBalance).minus(config.wallet.transactionFee);
                if(maxWithdraw.lte(0)) {
                    maxWithdraw = 0;
                }
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.big + ' ' + withdrawAmount + ' ' + config.messages.withdraw.big1 + ' ' + config.wallet.transactionFee + ' ' + config.messages.withdraw.big2 + ' ' + totalAmount + ' ' + config.messages.withdraw.big3 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + '. ' + config.messages.withdraw.big4 + ' ' + maxWithdraw + ' ' + config.wallet.coinSymbolShort + config.messages.withdraw.big5,false,false,false,false);
                return;
            }

            // Send withdrawal
            var txid = await wallet.wallet_send_to_address(withdrawAddress, withdrawAmount);
            if(!txid) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Subtract balance from user
            var subtractBalance = await user.user_substract_balance(totalAmount, userID);
            if(!subtractBalance) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
                return;
            }

            // Save withdrawal to database
            var saveWithdrawal = await transaction.transaction_save_withdrawal_to_db(userID, withdrawAddress, withdrawAmount, txid);
            
            // Log withdrawal
            log.log_write_database(userID, config.messages.log.withdrawrequest + ' ' + withdrawAddress + ' - ' + withdrawAmount + ' ' + config.wallet.coinSymbolShort, withdrawAmount);

            var replyFields = [
                [config.messages.withdraw.amount, withdrawAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.withdraw.address, withdrawAddress, false],
                [config.messages.withdraw.transaction, config.wallet.explorerLinkTransaction + txid, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,replyFields,config.messages.withdraw.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_withdraw: Error processing withdraw command');
            console.error(error);
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
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!tipUser || !tipAmount) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate tip user format
            if(!check.check_valid_discord_id(tipUser)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.notvalid,false,false,false,false);
                return;
            }

            // Extract user ID from mention
            var tipUserID = tipUser.replace(/[<@!>]/g, '');
            
            // Check if user is trying to tip themselves
            if(tipUserID === userID) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.self,false,false,false,false);
                return;
            }

            // Check if tip user is registered
            var tipUserRegistered = await user.user_registered_check(tipUserID);
            if(tipUserRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!tipUserRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.no,false,false,false,false);
                return;
            }

            // Validate amount
            if(!check.check_isNumeric(tipAmount) || Big(tipAmount).lte(0)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum tip
            if(Big(tipAmount).lt(config.wallet.minTipValue)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.min + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(tipAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.big + ' ' + tipAmount + ' ' + config.messages.tip.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.tip.big2,false,false,false,false);
                return;
            }

            // Process tip
            var subtractBalance = await user.user_substract_balance(tipAmount, userID);
            if(!subtractBalance) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var addBalance = await user.user_add_balance(tipAmount, tipUserID);
            if(!addBalance) {
                // Rollback
                await user.user_add_balance(tipAmount, userID);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Save payment to database
            await transaction.transaction_save_payment_to_db(tipAmount, userID, tipUserID, config.messages.payment.tip.send);
            await transaction.transaction_save_payment_to_db(tipAmount, userID, tipUserID, config.messages.payment.tip.received);

            // Log tip
            log.log_write_database(userID, config.messages.log.tip + ' ' + tipUserID, tipAmount);

            var replyFields = [
                [config.messages.tip.amount, tipAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.tip.user, tipUser, true]
            ];

            // Check if user wants to be mentioned
            var mentionUser = storage.storage_read_local_storage(tipUserID, 'notify');
            var mentionString = mentionUser !== false ? ' ' + tipUser : '';

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">" + mentionString,messageType,config.colors.success,false,config.messages.tip.title,replyFields,config.messages.tip.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_tip: Error processing tip command');
            console.error(error);
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
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
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
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(rainAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.big + ' ' + rainAmount + ' ' + config.messages.rain.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.rain.big2,false,false,false,false);
                return;
            }

            var rainUsers = [];
            var rainUserCount_final = 0;

            if(rainType === 'all') {
                // Rain to all registered users
                var totalUsers = await user.user_get_total_count();
                if(!totalUsers || totalUsers.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                
                rainUserCount_final = totalUsers[0].totalusers;
                
                // Check minimum amount per user
                var amountPerUser = Big(rainAmount).div(rainUserCount_final);
                if(amountPerUser.lt(config.wallet.minTipValue)) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount_final + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Subtract balance from sender
                var subtractBalance = await user.user_substract_balance(rainAmount, userID);
                if(!subtractBalance) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Add balance to all users
                var addBalanceAll = await user.user_add_balance_all(amountPerUser);
                if(!addBalanceAll) {
                    // Rollback
                    await user.user_add_balance(rainAmount, userID);
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Save payment
                await transaction.transaction_save_payment_to_db(rainAmount, userID, 'rainall', config.messages.payment.drop.send);

                // Log rain
                log.log_write_database(userID, config.messages.log.rain + ' ' + rainUserCount_final + ' ' + config.messages.log.rain1, rainAmount);

            } else if(rainType === 'online') {
                // Rain to online users
                var onlineUserCount = Object.keys(activeUsers).length;
                if(onlineUserCount === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,'No online users found.',false,false,false,false);
                    return;
                }

                rainUserCount_final = onlineUserCount;
                
                // Check minimum amount per user
                var amountPerUser = Big(rainAmount).div(rainUserCount_final);
                if(amountPerUser.lt(config.wallet.minTipValue)) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount_final + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Subtract balance from sender
                var subtractBalance = await user.user_substract_balance(rainAmount, userID);
                if(!subtractBalance) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Add balance to online users
                for(var onlineUserID in activeUsers) {
                    if(onlineUserID !== userID) { // Don't rain to sender
                        var userReg = await user.user_registered_check(onlineUserID);
                        if(userReg === true) {
                            await user.user_add_balance(amountPerUser, onlineUserID);
                            rainUsers.push('<@' + onlineUserID + '>');
                        }
                    }
                }

                // Log rain
                log.log_write_database(userID, config.messages.log.rain + ' ' + rainUserCount_final + ' ' + config.messages.log.rain1, rainAmount);

            } else if(rainType === 'random') {
                // Rain to random users
                if(!rainUserCount || !check.check_isNumeric(rainUserCount) || parseInt(rainUserCount) <= 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }

                rainUserCount_final = parseInt(rainUserCount);
                
                // Check maximum random users
                if(rainUserCount_final > config.wallet.maxRainRandomUsers) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.randommax + ' ' + config.wallet.maxRainRandomUsers + ' ' + config.messages.rain.randommax1,false,false,false,false);
                    return;
                }

                // Check minimum amount per user
                var amountPerUser = Big(rainAmount).div(rainUserCount_final);
                if(amountPerUser.lt(config.wallet.minTipValue)) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount_final + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Get random users
                var randomUsers = await user.user_get_discord_ids(rainUserCount_final);
                if(!randomUsers || randomUsers.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Subtract balance from sender
                var subtractBalance = await user.user_substract_balance(rainAmount, userID);
                if(!subtractBalance) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Add balance to random users
                for(var i = 0; i < randomUsers.length; i++) {
                    var randomUserID = randomUsers[i].discord_id;
                    if(randomUserID !== userID) { // Don't rain to sender
                        await user.user_add_balance(amountPerUser, randomUserID);
                        rainUsers.push('<@' + randomUserID + '>');
                    }
                }

                // Log rain
                log.log_write_database(userID, config.messages.log.rain + ' ' + rainUserCount_final + ' ' + config.messages.log.rain1, rainAmount);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var replyFields = [
                [config.messages.rain.amount, rainAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.rain.rounded, Big(rainAmount).div(rainUserCount_final).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.rain.users, rainUserCount_final, true],
                [config.messages.rain.each, Big(rainAmount).div(rainUserCount_final).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_rain: Error processing rain command');
            console.error(error);
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
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Validate parameters
            if(!dropType || !dropAmount || !dropTime) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate drop type
            if(dropType !== 'phrase' && dropType !== 'react') {
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.min + ' ' + config.bot.minDropValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
                return;
            }

            // Validate time
            if(!check.check_isNumeric(dropTime) || parseInt(dropTime) < config.bot.dropMinSeconds || parseInt(dropTime) > config.bot.dropMaxSeconds) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.minTime + ' ' + config.bot.dropMinSeconds + '. ' + config.messages.drop.maxTime + ' ' + config.bot.dropMaxSeconds + '.',false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(dropAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.big + ' ' + dropAmount + ' ' + config.messages.drop.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.drop.big2,false,false,false,false);
                return;
            }

            // Subtract balance from user
            var subtractBalance = await user.user_substract_balance(dropAmount, userID);
            if(!subtractBalance) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [
                [config.messages.drop.amount, dropAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.drop.seconds, dropTime, true]
            ];

            if(dropType === 'phrase') {
                if(!dropPhrase || dropPhrase.length < 3) {
                    // Rollback balance
                    await user.user_add_balance(dropAmount, userID);
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }
                
                replyFields.push([config.messages.drop.phrase, dropPhrase, false]);
                
                var dropMessage = await chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropPhraseReply,false,false,false,false);
                
                // Set up phrase drop collection
                this.setup_phrase_drop(messageFull, userID, dropAmount, dropTime, dropPhrase, dropMessage);
                
            } else if(dropType === 'react') {
                replyFields.push([config.messages.drop.icon, config.bot.dropReactIcon, false]);
                
                var dropMessage = await chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropReactReply,false,false,false,false);
                
                // Add reaction to message
                if(dropMessage) {
                    await dropMessage.react(config.bot.dropReactIcon);
                }
                
                // Set up react drop collection
                this.setup_react_drop(messageFull, userID, dropAmount, dropTime, dropMessage);
            }

            // Log drop
            log.log_write_database(userID, 'Drop started: ' + dropAmount + ' ' + config.wallet.coinSymbolShort, dropAmount);
            
        } catch (error) {
            console.error('command_drop: Error processing drop command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Setup phrase drop collection
    /* ------------------------------------------------------------------------------ */

    setup_phrase_drop: function(originalMessage, senderID, dropAmount, dropTime, dropPhrase, dropMessage) {
        var dropUsers = new Set();
        var dropTimeMs = parseInt(dropTime) * 1000;
        
        const filter = (msg) => {
            return msg.content === dropPhrase && 
                   msg.author.id !== senderID && 
                   !msg.author.bot &&
                   msg.channel.id === originalMessage.channel.id;
        };

        const collector = originalMessage.channel.createMessageCollector({ 
            filter, 
            time: dropTimeMs 
        });

        collector.on('collect', async (msg) => {
            var participantID = msg.author.id;
            
            // Check if user is registered
            var userRegistered = await user.user_registered_check(participantID);
            if(userRegistered === true && !dropUsers.has(participantID)) {
                dropUsers.add(participantID);
                
                // React to show participation
                try {
                    await msg.react(config.bot.dropBotReactIcon);
                } catch (error) {
                    console.log('Could not react to drop participation message');
                }
            }
        });

        collector.on('end', async () => {
            await this.finalize_drop(originalMessage, senderID, dropAmount, dropUsers, dropMessage);
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Setup react drop collection
    /* ------------------------------------------------------------------------------ */

    setup_react_drop: function(originalMessage, senderID, dropAmount, dropTime, dropMessage) {
        var dropUsers = new Set();
        var dropTimeMs = parseInt(dropTime) * 1000;
        
        if(!dropMessage) return;

        const filter = (reaction, user) => {
            return reaction.emoji.name === config.bot.dropReactIcon && 
                   user.id !== senderID && 
                   !user.bot;
        };

        const collector = dropMessage.createReactionCollector({ 
            filter, 
            time: dropTimeMs 
        });

        collector.on('collect', async (reaction, user) => {
            var participantID = user.id;
            
            // Check if user is registered
            var userRegistered = await user.user_registered_check(participantID);
            if(userRegistered === true && !dropUsers.has(participantID)) {
                dropUsers.add(participantID);
            }
        });

        collector.on('end', async () => {
            await this.finalize_drop(originalMessage, senderID, dropAmount, dropUsers, dropMessage);
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Finalize drop distribution
    /* ------------------------------------------------------------------------------ */

    finalize_drop: async function(originalMessage, senderID, dropAmount, dropUsers, dropMessage) {
        try {
            var participantCount = dropUsers.size;
            
            if(participantCount < config.bot.dropMinUsers) {
                // Refund the drop amount
                await user.user_add_balance(dropAmount, senderID);
                
                var replyFields = [
                    [config.messages.drop.minFailedUser, participantCount, true],
                    [config.messages.drop.minFailedUser1, config.bot.dropMinUsers, true]
                ];
                
                chat.chat_reply(originalMessage,'embed',false,'guild',config.colors.warning,false,config.messages.drop.minFailedUserTitle,replyFields,false,false,false,false,false);
                return;
            }

            var amountPerUser = Big(dropAmount).div(participantCount);
            var dropUsersList = [];

            // Distribute to participants
            for(let participantID of dropUsers) {
                await user.user_add_balance(amountPerUser, participantID);
                await transaction.transaction_save_payment_to_db(amountPerUser, senderID, participantID, config.messages.payment.drop.received);
                dropUsersList.push('<@' + participantID + '>');
            }

            // Save sender payment record
            await transaction.transaction_save_payment_to_db(dropAmount, senderID, 'drop', config.messages.payment.drop.send);

            // Log drop completion
            log.log_write_database(senderID, config.messages.log.drop + ' ' + participantCount + ' ' + config.messages.log.drop1, dropAmount);

            var replyFields = [
                [config.messages.drop.amount, dropAmount + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.drop.rounded, amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                [config.messages.drop.users, participantCount, true],
                [config.messages.drop.each, amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(originalMessage,'embed',false,'guild',config.colors.success,false,config.messages.drop.titleSent,replyFields,config.messages.drop.description,false,false,false,false);
            
        } catch (error) {
            console.error('finalize_drop: Error finalizing drop');
            console.error(error);
            
            // Refund on error
            await user.user_add_balance(dropAmount, senderID);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // History command
    /* ------------------------------------------------------------------------------ */

    command_history: async function(messageFull,userID,userName,messageType,userRole,historyType){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            if(!historyType) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            if(historyType === 'deposits' || historyType === 'd') {
                // Get user deposit address
                var userAddress = await user.user_get_address(userID);
                if(!userAddress) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                // Get deposits
                var deposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory, userAddress);
                if(!deposits || deposits.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                    return;
                }

                var replyFields = [];
                for(var i = 0; i < deposits.length; i++) {
                    var deposit = deposits[i];
                    var status = deposit.credited ? config.messages.history.deposits.credited : config.messages.history.deposits.pending;
                    
                    replyFields.push([
                        config.messages.history.deposits.amount + ': ' + deposit.amount + ' ' + config.wallet.coinSymbolShort,
                        config.messages.history.deposits.status + ': ' + status + '\n' +
                        config.messages.history.deposits.confirmations + ': ' + deposit.confirmations + '\n' +
                        config.messages.history.deposits.view + ': ' + config.wallet.explorerLinkTransaction + deposit.txid,
                        false
                    ]);
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,replyFields,config.messages.history.deposits.description + ' ' + config.wallet.minConfirmationsCredit + ' ' + config.messages.history.deposits.description1 + ' ' + config.wallet.depositsConfirmationTime + ' ' + config.messages.history.deposits.description2,false,false,false,false);

            } else if(historyType === 'withdrawals' || historyType === 'w') {
                // Get withdrawals
                var withdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount, userID);
                if(!withdrawals || withdrawals.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                    return;
                }

                var replyFields = [];
                for(var i = 0; i < withdrawals.length; i++) {
                    var withdrawal = withdrawals[i];
                    
                    replyFields.push([
                        withdrawal.amount + ' ' + config.wallet.coinSymbolShort + ' → ' + withdrawal.address,
                        config.wallet.explorerLinkTransaction + withdrawal.txid,
                        false
                    ]);
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,replyFields,config.messages.history.withdrawals.description,false,false,false,false);

            } else if(historyType === 'payments' || historyType === 'p') {
                // Get payments
                var payments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun, userID);
                if(!payments || payments.length === 0) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                    return;
                }

                var replyFields = [];
                for(var i = 0; i < payments.length; i++) {
                    var payment = payments[i];
                    
                    replyFields.push([
                        config.messages.history.payments.type + ': ' + payment.type,
                        config.messages.history.payments.amount + ': ' + payment.amount + ' ' + config.wallet.coinSymbolShort,
                        true
                    ]);
                }

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,replyFields,config.messages.history.payments.description,false,false,false,false);

            } else {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_history: Error processing history command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Update command
    /* ------------------------------------------------------------------------------ */

    command_update: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Update username
            var userNameString = check.check_slice_string(userName.username, 25);
            var updateUser = await user.user_update_username(userNameString, userID);
            
            if(!updateUser) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log update
            log.log_write_database(userID, config.messages.log.username + ' ' + userNameString);
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_update: Error processing update command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Donate command
    /* ------------------------------------------------------------------------------ */

    command_donate: async function(messageFull,userID,userName,messageType,userRole){
        try {
            var replyFields = [
                [config.messages.donate.address, config.wallet.donateAddress, false]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,replyFields,config.messages.donate.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_donate: Error processing donate command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Stake command
    /* ------------------------------------------------------------------------------ */

    command_stake: async function(messageFull,userID,userName,messageType,userRole,stakeAmount){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.min + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(stakeAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.big + ' ' + stakeAmount + ' ' + config.messages.stake.big1 + ' ' + userBalance + ' ' + config.wallet.coinSymbolShort + config.messages.stake.big2,false,false,false,false);
                return;
            }

            // Get current datetime for unstake timer
            var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');

            // Subtract from balance and add to stake balance
            var subtractBalance = await user.user_substract_balance(stakeAmount, userID);
            if(!subtractBalance) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var addStakeBalance = await user.user_add_stake_balance(stakeAmount, userID, currentDatetime);
            if(!addStakeBalance) {
                // Rollback
                await user.user_add_balance(stakeAmount, userID);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log stake
            log.log_write_database(userID, config.messages.log.stakeadd, stakeAmount);

            var replyFields = [
                [config.messages.stake.amount, stakeAmount + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.stake.title,replyFields,config.messages.stake.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_stake: Error processing stake command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Unstake command
    /* ------------------------------------------------------------------------------ */

    command_unstake: async function(messageFull,userID,userName,messageType,userRole,unstakeAmount){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered) {
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.min + ' ' + config.staking.minUnstake + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
                return;
            }

            // Get user stake balance
            var userStakeBalance = await user.user_get_stake_balance(userID);
            if(userStakeBalance === false) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough stake balance
            if(Big(userStakeBalance).lt(unstakeAmount)) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.big + ' ' + unstakeAmount + ' ' + config.messages.unstake.big1 + ' ' + userStakeBalance + ' ' + config.wallet.coinSymbolShort + config.messages.unstake.big2,false,false,false,false);
                return;
            }

            // Check lock time
            var userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var userData = userInfo[0];
            var lastUnstakeTime = moment(userData.unstake_datetime).tz(config.staking.timezone);
            var currentTime = moment().tz(config.staking.timezone);
            var timeDiff = currentTime.diff(lastUnstakeTime, 'seconds');

            if(timeDiff < config.staking.lockTime) {
                var remainingTime = config.staking.lockTime - timeDiff;
                var days = Math.floor(remainingTime / 86400);
                var hours = Math.floor((remainingTime % 86400) / 3600);
                var minutes = Math.floor((remainingTime % 3600) / 60);
                var seconds = remainingTime % 60;

                var timeString = '';
                if(days > 0) timeString += days + ' ' + config.messages.unstake.leftdays + ' ';
                if(hours > 0) timeString += hours + ' ' + config.messages.unstake.lefthours + ' ';
                if(minutes > 0) timeString += minutes + ' ' + config.messages.unstake.leftminutes + ' ';
                if(seconds > 0) timeString += seconds + ' ' + config.messages.unstake.leftseconds;

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.unstake.locked,false,config.messages.unstake.left + ' ' + timeString + config.messages.unstake.left2,false,false,false,false);
                return;
            }

            // Check if remaining stake would be below minimum
            var remainingStake = Big(userStakeBalance).minus(unstakeAmount);
            if(remainingStake.gt(0) && remainingStake.lt(config.staking.minStake)) {
                // Unstake all instead
                unstakeAmount = userStakeBalance;
                
                var replyFields = [
                    [config.messages.unstake.rest, remainingStake.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.unstake.rest2, config.staking.minStake + ' ' + config.wallet.coinSymbolShort, true]
                ];
                
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,replyFields,config.messages.unstake.rest3,false,false,false,false);
            }

            // Get current datetime for unstake timer
            var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');

            // Subtract from stake balance and add to balance
            var subtractStakeBalance = await user.user_substract_stake_balance(unstakeAmount, userID, currentDatetime);
            if(!subtractStakeBalance) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var addBalance = await user.user_add_balance(unstakeAmount, userID);
            if(!addBalance) {
                // Rollback
                await user.user_add_stake_balance(unstakeAmount, userID, currentDatetime);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log unstake
            log.log_write_database(userID, config.messages.log.unstakeadd, unstakeAmount);

            var replyFields = [
                [config.messages.unstake.amount, unstakeAmount + ' ' + config.wallet.coinSymbolShort, true]
            ];

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.unstake.title,replyFields,config.messages.unstake.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_unstake: Error processing unstake command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Notify command
    /* ------------------------------------------------------------------------------ */

    command_notify: async function(messageFull,userID,userName,messageType,userRole,notifyOption){
        try {
            if(!notifyOption || (notifyOption !== 'on' && notifyOption !== 'off')) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            if(notifyOption === 'on') {
                storage.storage_write_local_storage(userID, 'notify', true);
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,config.messages.notify.enabled,false,false,false,false);
            } else {
                storage.storage_delete_local_storage(userID, 'notify');
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,config.messages.notify.disabled,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_notify: Error processing notify command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Version command
    /* ------------------------------------------------------------------------------ */

    command_version: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Get wallet info
            var walletInfo = await wallet.wallet_get_info();
            if(walletInfo === 'error') {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            var replyFields = [
                [config.messages.version.botversion, config.bot.version, true]
            ];

            if(walletInfo.version) {
                replyFields.push([config.messages.version.walletversion, walletInfo.version, true]);
            }
            if(walletInfo.protocolversion) {
                replyFields.push([config.messages.version.walletprotocolversion, walletInfo.protocolversion, true]);
            }
            if(walletInfo.connections) {
                replyFields.push([config.messages.version.walletconnections, walletInfo.connections, true]);
            }
            if(walletInfo.blocks) {
                replyFields.push([config.messages.version.walletblocks, walletInfo.blocks, true]);
            }
            if(walletInfo.difficulty) {
                replyFields.push([config.messages.version.walletdifficulty, walletInfo.difficulty, true]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,replyFields,false,false,false,false,false);
            
        } catch (error) {
            console.error('command_version: Error processing version command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear command (Admin only)
    /* ------------------------------------------------------------------------------ */

    command_clear: async function(messageFull,userID,userName,messageType,userRole){
        try {
            if(messageType === 1) { // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.clear.no,false,false,false,false);
                return;
            }

            // This command would need additional implementation for message deletion
            // For now, just acknowledge the command
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Clear Command',false,'Clear command executed.',false,false,false,false);
            
        } catch (error) {
            console.error('command_clear: Error processing clear command');
            console.error(error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get deposits (Admin only)
    /* ------------------------------------------------------------------------------ */

    command_get_deposits: async function(messageFull,userID,userName,messageType,userRole,manual){
        try {
            var deposits = await wallet.wallet_get_latest_deposits();
            if(!deposits) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            var processedCount = 0;
            for(var i = 0; i < deposits.length; i++) {
                var deposit = deposits[i];
                if(deposit.category === 'receive' && deposit.address) {
                    var result = await transaction.transaction_add_update_deposits_on_db(
                        deposit.address,
                        deposit.amount,
                        deposit.confirmations,
                        deposit.txid
                    );
                    if(result) processedCount++;
                }
            }

            var messageType_final = manual ? config.messages.getdeposits.manually : config.messages.getdeposits.cron;
            console.log(messageType_final + ' ' + processedCount + ' ' + config.messages.getdeposits.deposits);
            
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Get Deposits',false,messageType_final + ' ' + processedCount + ' ' + config.messages.getdeposits.deposits,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_get_deposits: Error processing get deposits command');
            console.error(error);
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit deposits (Admin only)
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(messageFull,userID,userName,messageType,userRole,manual){
        try {
            var confirmedDeposits = await transaction.transaction_get_confirmed_deposits();
            if(!confirmedDeposits) {
                if(manual) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                }
                return;
            }

            var creditedCount = 0;
            for(var i = 0; i < confirmedDeposits.length; i++) {
                var deposit = confirmedDeposits[i];
                
                // Credit user balance
                var creditResult = await user.user_credit_balance(deposit.address, deposit.amount);
                if(creditResult) {
                    // Mark deposit as credited
                    var markResult = await transaction.transaction_set_deposit_confirmed(deposit.id);
                    if(markResult) {
                        creditedCount++;
                        
                        // Get user ID for logging
                        var depositUserID = await user.user_get_id_by_address(deposit.address);
                        if(depositUserID && depositUserID !== 'notregisteredaddress') {
                            log.log_write_database(depositUserID, config.messages.log.transctioncredited + ' ' + deposit.address + ' - ' + deposit.amount + ' ' + config.wallet.coinSymbolShort, deposit.amount);
                        } else {
                            log.log_write_database('system', config.messages.log.transctioncreditedunknown + ' ' + deposit.address + ' - ' + deposit.amount + ' ' + config.wallet.coinSymbolShort, deposit.amount);
                        }
                    }
                }
            }

            var messageType_final = manual ? config.messages.creditdeposits.manually : config.messages.creditdeposits.cron;
            console.log(messageType_final + ' ' + creditedCount + ' ' + config.messages.creditdeposits.deposits);
            
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Credit Deposits',false,messageType_final + ' ' + creditedCount + ' ' + config.messages.creditdeposits.deposits,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_credit_deposits: Error processing credit deposits command');
            console.error(error);
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get stakes (Admin only)
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(messageFull,userID,userName,messageType,userRole,manual){
        try {
            var stakeTransactions = await transaction.transaction_get_stake_transactions();
            if(!stakeTransactions) {
                if(manual) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                }
                return;
            }

            var processedCount = 0;
            for(var i = 0; i < stakeTransactions.length; i++) {
                var stakeTransaction = stakeTransactions[i];
                
                // Get transaction details
                var txDetails = await wallet.wallet_get_transaction(stakeTransaction.txid);
                if(txDetails) {
                    var stakeReward = await wallet.wallet_calculate_stake_reward(txDetails);
                    var isStake = stakeReward !== null && stakeReward > 0 ? 1 : 0;
                    var stakeAmount = stakeReward || 0;
                    
                    // Update transaction
                    var updateResult = await transaction.transaction_update_stake_transaction(
                        stakeTransaction.txid,
                        stakeAmount,
                        isStake
                    );
                    
                    if(updateResult) {
                        processedCount++;
                        
                        if(config.staking.debug && isStake) {
                            console.log('Stake found: ' + stakeTransaction.txid + ' - Reward: ' + stakeAmount);
                        }
                    }
                }
            }

            var messageType_final = manual ? config.messages.getstakes.manually : config.messages.getstakes.cron;
            console.log(messageType_final + ' ' + processedCount + ' ' + config.messages.getstakes.transactions);
            
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Get Stakes',false,messageType_final + ' ' + processedCount + ' ' + config.messages.getstakes.transactions,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_get_stakes: Error processing get stakes command');
            console.error(error);
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit stakes (Admin only)
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(messageFull,userID,userName,messageType,userRole,manual){
        try {
            var stakesToCredit = await transaction.transaction_get_stake_transactions_to_credit();
            if(!stakesToCredit || stakesToCredit.length === 0) {
                if(manual) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Credit Stakes',false,'No stakes to credit.',false,false,false,false);
                }
                return;
            }

            // Get wallet balance for calculations
            var walletBalance = await wallet.wallet_get_balance();
            if(!walletBalance) {
                if(manual) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                }
                return;
            }

            // Get all stake users
            var stakeUsers = await user.user_get_stake_users();
            if(!stakeUsers || stakeUsers.length === 0) {
                if(manual) {
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,'Credit Stakes',false,'No users with stake balance found.',false,false,false,false);
                }
                return;
            }

            // Calculate total stake amount from transactions
            var totalStakeAmount = Big(0);
            var highestTransactionID = 0;
            
            for(var i = 0; i < stakesToCredit.length; i++) {
                totalStakeAmount = totalStakeAmount.plus(stakesToCredit[i].amount);
                if(stakesToCredit[i].id > highestTransactionID) {
                    highestTransactionID = stakesToCredit[i].id;
                }
            }

            // Calculate total user stake balance
            var totalUserStakeBalance = Big(0);
            for(var i = 0; i < stakeUsers.length; i++) {
                totalUserStakeBalance = totalUserStakeBalance.plus(stakeUsers[i].stake_balance);
            }

            // Calculate stake amount for users (minus owner percentage)
            var ownerPercentage = Big(config.staking.ownerPercentage).div(100);
            var totalStakeForStakers = totalStakeAmount.times(Big(1).minus(ownerPercentage));

            if(config.staking.debug) {
                console.log(config.messages.log.stakecredit + ' ' + walletBalance);
                console.log(config.messages.log.stakecredit1 + ' ' + totalStakeAmount.toFixed(8));
                console.log(config.messages.log.stakecredit2 + ' ' + totalStakeForStakers.toFixed(8));
                console.log(config.messages.log.stakecredit3 + ' ' + stakeUsers.length);
                console.log(config.messages.log.stakecredit5 + ' ' + totalUserStakeBalance.toFixed(8));
                console.log(config.messages.log.stakecredit6 + ' ' + totalStakeForStakers.toFixed(8));
            }

            // Distribute stakes to users
            var creditedUsers = 0;
            for(var i = 0; i < stakeUsers.length; i++) {
                var stakeUser = stakeUsers[i];
                var userStakeBalance = Big(stakeUser.stake_balance);
                
                // Calculate user's share of the total stake reward
                var userShare = userStakeBalance.div(totalUserStakeBalance);
                var userReward = totalStakeForStakers.times(userShare);
                
                if(userReward.gt(0)) {
                    // Add reward to user balance
                    var addResult = await user.user_add_balance(userReward.toFixed(8), stakeUser.discord_id);
                    if(addResult) {
                        creditedUsers++;
                        
                        // Save payment record
                        await transaction.transaction_save_payment_to_db(
                            userReward.toFixed(8),
                            config.bot.botID,
                            stakeUser.discord_id,
                            config.messages.payment.stake.received
                        );
                        
                        // Log stake credit
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit8 + ' ' + stakeUser.discord_id, userReward.toFixed(8));
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit9 + ' ' + userStakeBalance.toFixed(8), userReward.toFixed(8));
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit10 + ' ' + userReward.toFixed(8), userReward.toFixed(8));
                        
                        if(config.staking.debug) {
                            console.log(config.messages.log.stakecredit8 + ' ' + stakeUser.discord_id);
                            console.log(config.messages.log.stakecredit9 + ' ' + userStakeBalance.toFixed(8));
                            console.log(config.messages.log.stakecredit10 + ' ' + userReward.toFixed(8));
                        }
                    }
                }
            }

            // Mark transactions as credited
            if(creditedUsers > 0) {
                await transaction.transaction_update_stake_transaction_credited(highestTransactionID);
            }

            var messageType_final = manual ? config.messages.creditstakes.manually : config.messages.creditstakes.cron;
            console.log(messageType_final + ' ' + stakesToCredit.length + ' ' + config.messages.creditstakes.transactions);

            // Send pool notification if configured
            if(config.bot.stakePoolChannelID && totalStakeForStakers.gt(0)) {
                var poolFields = [
                    [config.messages.creditstakes.stakes, stakesToCredit.length, true],
                    [config.messages.creditstakes.amount, totalStakeForStakers.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
                    [config.messages.creditstakes.users, creditedUsers, true]
                ];

                chat.chat_reply(messageFull,'pool',false,'guild',config.colors.success,false,config.messages.creditstakes.title,poolFields,config.messages.creditstakes.description,false,false,false,false);
            }
            
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,'Credit Stakes',false,messageType_final + ' ' + stakesToCredit.length + ' ' + config.messages.creditstakes.transactions,false,false,false,false);
            }
            
        } catch (error) {
            console.error('command_credit_stakes: Error processing credit stakes command');
            console.error(error);
            if(manual) {
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    }

};