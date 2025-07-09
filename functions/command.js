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

// Import functions
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

    fire_command: async function(msg,userID,userName,messageType,userRole,commandName,commandPartOne,commandPartTwo,commandPartThree,commandPartFour,serverUsers,activeUsers){

        // Get username for logging and replies
        var userNameForReply = userName.username || userName.globalName || userName.displayName || 'Unknown';
        var userNameSliced = check.check_slice_string(userNameForReply, 25);

        // Check if user is currently processing another command
        var userCurrentlyBlocked = await storage.storage_read_local_storage(userID, 'currentlyBlocked');
        if(userCurrentlyBlocked){
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }

        // Block user for processing
        await storage.storage_write_local_storage(userID, 'currentlyBlocked', true);

        try {
            // Process commands based on commandName
            switch(commandName) {
                case 'help':
                case 'h':
                    if(config.commands.help) {
                        await this.command_help(msg, userID, messageType, userRole);
                    }
                    break;

                case 'register':
                case 'r':
                    if(config.commands.register) {
                        await this.command_register(msg, userID, userNameSliced, messageType);
                    }
                    break;

                case 'profile':
                case 'p':
                    if(config.commands.profile) {
                        await this.command_profile(msg, userID, messageType);
                    }
                    break;

                case 'balance':
                case 'b':
                    if(config.commands.balance) {
                        await this.command_balance(msg, userID, messageType);
                    }
                    break;

                case 'deposit':
                case 'd':
                    if(config.commands.deposit) {
                        await this.command_deposit(msg, userID, messageType);
                    }
                    break;

                case 'withdraw':
                case 'w':
                    if(config.commands.withdraw) {
                        await this.command_withdraw(msg, userID, messageType, commandPartOne, commandPartTwo);
                    }
                    break;

                case 'tip':
                    if(config.commands.tip) {
                        await this.command_tip(msg, userID, messageType, commandPartOne, commandPartTwo);
                    }
                    break;

                case 'rain':
                    if(config.commands.rain) {
                        await this.command_rain(msg, userID, messageType, commandPartOne, commandPartTwo, commandPartThree, activeUsers);
                    }
                    break;

                case 'drop':
                    if(config.commands.drop) {
                        await this.command_drop(msg, userID, messageType, commandPartOne, commandPartTwo, commandPartThree, commandPartFour);
                    }
                    break;

                case 'history':
                    if(config.commands.history) {
                        await this.command_history(msg, userID, messageType, commandPartOne);
                    }
                    break;

                case 'update':
                case 'u':
                    if(config.commands.update) {
                        await this.command_update(msg, userID, userNameSliced, messageType);
                    }
                    break;

                case 'donate':
                    if(config.commands.donate) {
                        await this.command_donate(msg, userID, messageType);
                    }
                    break;

                case 'stake':
                    if(config.commands.stake) {
                        await this.command_stake(msg, userID, messageType, commandPartOne);
                    }
                    break;

                case 'unstake':
                    if(config.commands.unstake) {
                        await this.command_unstake(msg, userID, messageType, commandPartOne);
                    }
                    break;

                case 'notify':
                    if(config.commands.notify) {
                        await this.command_notify(msg, userID, messageType, commandPartOne);
                    }
                    break;

                case 'version':
                case 'v':
                    if(config.commands.version) {
                        await this.command_version(msg, userID, messageType);
                    }
                    break;

                // Admin commands
                case 'getdeposits':
                case 'gd':
                    if(config.commands.getdeposits && userRole >= 3) {
                        await this.command_get_deposits(msg, userID, messageType, 1);
                    }
                    break;

                case 'creditdeposits':
                case 'cd':
                    if(config.commands.creditdeposits && userRole >= 3) {
                        await this.command_credit_deposits(msg, userID, messageType, 1);
                    }
                    break;

                case 'getstakes':
                case 'gs':
                    if(config.commands.getstakes && userRole >= 3) {
                        await this.command_get_stakes(msg, userID, messageType, 1);
                    }
                    break;

                case 'creditstakes':
                case 'cs':
                    if(config.commands.creditstakes && userRole >= 3) {
                        await this.command_credit_stakes(msg, userID, messageType, 1);
                    }
                    break;

                case 'clear':
                case 'c':
                    if(config.commands.clear && userRole >= 3) {
                        await this.command_clear(msg, userID, messageType);
                    }
                    break;

                default:
                    // Unknown command
                    chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    break;
            }
        } catch (error) {
            var errorMessage = "fire_command: Error processing command " + commandName;
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        } finally {
            // Always unblock user
            await storage.storage_delete_local_storage(userID, 'currentlyBlocked');
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Help command
    /* ------------------------------------------------------------------------------ */

    command_help: async function(msg, userID, messageType, userRole) {
        var helpFields = [];
        
        // Regular user commands
        if(config.commands.register) {
            helpFields.push([config.messages.help.registerTitle, config.messages.help.registerValue, false]);
        }
        if(config.commands.profile) {
            helpFields.push([config.messages.help.profileTitle, config.messages.help.profileValue, false]);
        }
        if(config.commands.balance) {
            helpFields.push([config.messages.help.balanceTitle, config.messages.help.balanceValue, false]);
        }
        if(config.commands.deposit) {
            helpFields.push([config.messages.help.depositTitle, config.messages.help.depositValue, false]);
        }
        if(config.commands.withdraw) {
            helpFields.push([config.messages.help.withdrawTitle, config.messages.help.withdrawValue, false]);
        }
        if(config.commands.tip) {
            helpFields.push([config.messages.help.tipTitle, config.messages.help.tipValue, false]);
        }
        if(config.commands.rain) {
            helpFields.push([config.messages.help.rainTitle, config.messages.help.rainValue, false]);
        }
        if(config.commands.drop) {
            helpFields.push([config.messages.help.dropTitle, config.messages.help.dropValue, false]);
        }
        if(config.commands.history) {
            helpFields.push([config.messages.help.historyTitle, config.messages.help.historyValue, false]);
        }
        if(config.commands.update) {
            helpFields.push([config.messages.help.updateTitle, config.messages.help.updateValue, false]);
        }
        if(config.commands.donate) {
            helpFields.push([config.messages.help.donateTitle, config.messages.help.donateValue, false]);
        }
        if(config.commands.stake) {
            helpFields.push([config.messages.help.stakeTitle, config.messages.help.stakeValue, false]);
        }
        if(config.commands.unstake) {
            helpFields.push([config.messages.help.unstakeTitle, config.messages.help.unstakeValue, false]);
        }
        if(config.commands.notify) {
            helpFields.push([config.messages.help.notifyTitle, config.messages.help.notifyValue, false]);
        }
        if(config.commands.version) {
            helpFields.push([config.messages.help.versionTitle, config.messages.help.versionValue, false]);
        }

        // Admin commands for admins
        if(userRole >= 3) {
            helpFields.push([0, 0, false]); // Spacer
            helpFields.push([config.messages.help.admin.title, "** **", false]);
            
            if(config.commands.getdeposits) {
                helpFields.push([config.messages.help.admin.getDepositsTitle, config.messages.help.admin.getDepositsValue, false]);
            }
            if(config.commands.creditdeposits) {
                helpFields.push([config.messages.help.admin.creditDepositsTitle, config.messages.help.admin.creditDepositsValue, false]);
            }
            if(config.commands.getstakes) {
                helpFields.push([config.messages.help.admin.getStakesTitle, config.messages.help.admin.getStakesValue, false]);
            }
            if(config.commands.creditstakes) {
                helpFields.push([config.messages.help.admin.creditStakesTitle, config.messages.help.admin.creditStakesValue, false]);
            }
            if(config.commands.clear) {
                helpFields.push([config.messages.help.admin.clearTitle, config.messages.help.admin.clearValue, false]);
            }
        }

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.help.title,helpFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Register command
    /* ------------------------------------------------------------------------------ */

    command_register: async function(msg, userID, userName, messageType) {
        // Check if user is already registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.register.already,false,false,false,false);
            return;
        }

        // Register user
        var registerResult = await user.user_register(userName, userID);
        if(!registerResult) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Log registration
        log.log_write_database(userID, config.messages.log.registered);

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Profile command
    /* ------------------------------------------------------------------------------ */

    command_profile: async function(msg, userID, messageType) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user info
        var userInfo = await user.user_get_info(userID);
        if(!userInfo || userInfo.length === 0) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        var profileFields = [
            [config.messages.profile.userid, userInfo[0].discord_id, true],
            [config.messages.profile.username, userInfo[0].username, true],
            [config.messages.profile.registered, moment(userInfo[0].register_datetime).format('YYYY-MM-DD HH:mm:ss'), true]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,profileFields,config.messages.profile.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Balance command
    /* ------------------------------------------------------------------------------ */

    command_balance: async function(msg, userID, messageType) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(userBalance === false) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        var balanceFields = [
            [config.messages.balance.balance, Big(userBalance).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]
        ];

        // Add stake balance if staking is enabled
        if(config.staking.balanceDisplay) {
            var userStakeBalance = await user.user_get_stake_balance(userID);
            if(userStakeBalance !== false) {
                balanceFields.push([config.messages.balance.stakeTitle, Big(userStakeBalance).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]);
            }
        }

        // Get user info for username
        var userInfo = await user.user_get_info(userID);
        if(userInfo && userInfo.length > 0) {
            balanceFields.push([config.messages.balance.username, userInfo[0].username, true]);
        }

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,balanceFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Deposit command
    /* ------------------------------------------------------------------------------ */

    command_deposit: async function(msg, userID, messageType) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user deposit address
        var userDepositAddress = await user.user_get_address(userID);
        
        // If no address exists, create one
        if(!userDepositAddress) {
            var newAddress = await wallet.wallet_create_deposit_address();
            if(!newAddress) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Save address to database
            var addAddressResult = await user.user_add_deposit_address(newAddress, userID);
            if(!addAddressResult) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            userDepositAddress = newAddress;
            log.log_write_database(userID, config.messages.log.depositaddress);
        }

        var depositFields = [
            [config.messages.deposit.address, userDepositAddress, false]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,depositFields,config.messages.deposit.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Withdraw command
    /* ------------------------------------------------------------------------------ */

    command_withdraw: async function(msg, userID, messageType, withdrawAddress, withdrawAmount) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Validate parameters
        if(!withdrawAddress || !withdrawAmount) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Validate amount
        if(!check.check_isNumeric(withdrawAmount) || Big(withdrawAmount).lte(0)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check minimum withdrawal
        if(Big(withdrawAmount).lt(config.wallet.minWithdrawalValue)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.min + ' ' + config.wallet.minWithdrawalValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Validate address
        var addressValid = await wallet.wallet_validate_address(withdrawAddress);
        if(addressValid === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }
        
        if(!addressValid) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.notvalid,false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(userBalance === false) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance (including fee)
        var totalWithdraw = Big(withdrawAmount).plus(config.wallet.transactionFee);
        if(Big(userBalance).lt(totalWithdraw)) {
            var maxWithdraw = Big(userBalance).minus(config.wallet.transactionFee);
            if(maxWithdraw.lte(0)) {
                maxWithdraw = Big(0);
            }
            
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,
                config.messages.withdraw.big + ' ' + Big(withdrawAmount).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.withdraw.big1 + ' ' + Big(config.wallet.transactionFee).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.withdraw.big2 + ' ' + totalWithdraw.toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.withdraw.big3 + ' ' + Big(userBalance).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.withdraw.big4 + ' ' + maxWithdraw.toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.withdraw.big5,false,false,false,false);
            return;
        }

        // Send withdrawal
        var txid = await wallet.wallet_send_to_address(withdrawAddress, withdrawAmount);
        if(!txid) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }

        // Subtract balance from user
        var subtractResult = await user.user_substract_balance(totalWithdraw, userID);
        if(!subtractResult) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
            return;
        }

        // Save withdrawal to database
        var saveWithdrawal = await transaction.transaction_save_withdrawal_to_db(userID, withdrawAddress, withdrawAmount, txid);
        if(!saveWithdrawal) {
            log.log_write_console('Failed to save withdrawal to database: ' + txid);
        }

        // Log withdrawal
        log.log_write_database(userID, config.messages.log.withdrawrequest + ' ' + withdrawAddress, Big(withdrawAmount).toString());

        var withdrawFields = [
            [config.messages.withdraw.amount, Big(withdrawAmount).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
            [config.messages.withdraw.address, withdrawAddress, false],
            [config.messages.withdraw.transaction, config.wallet.explorerLinkTransaction + txid, false]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,withdrawFields,config.messages.withdraw.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Tip command
    /* ------------------------------------------------------------------------------ */

    command_tip: async function(msg, userID, messageType, tipUser, tipAmount) {
        // Check if private message
        if(messageType === 1) { // DM
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.private,false,false,false,false);
            return;
        }

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Validate parameters
        if(!tipUser || !tipAmount) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Validate tip user format
        if(!check.check_valid_discord_id(tipUser)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.notvalid,false,false,false,false);
            return;
        }

        // Extract user ID from mention
        var tipUserID = tipUser.replace(/[<@!>]/g, '');

        // Check if trying to tip self
        if(tipUserID === userID) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.self,false,false,false,false);
            return;
        }

        // Check if tip user is registered
        var tipUserRegistered = await user.user_registered_check(tipUserID);
        if(tipUserRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!tipUserRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.no,false,false,false,false);
            return;
        }

        // Validate amount
        if(!check.check_isNumeric(tipAmount) || Big(tipAmount).lte(0)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check minimum tip
        if(Big(tipAmount).lt(config.wallet.minTipValue)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.min + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(userBalance === false) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(tipAmount)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,
                config.messages.tip.big + ' ' + Big(tipAmount).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.tip.big1 + ' ' + Big(userBalance).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.tip.big2,false,false,false,false);
            return;
        }

        // Process tip
        var subtractResult = await user.user_substract_balance(tipAmount, userID);
        if(!subtractResult) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        var addResult = await user.user_add_balance(tipAmount, tipUserID);
        if(!addResult) {
            // Try to refund
            await user.user_add_balance(tipAmount, userID);
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Save payment to database
        await transaction.transaction_save_payment_to_db(tipAmount, userID, tipUserID, config.messages.payment.tip.send);

        // Log tip
        log.log_write_database(userID, config.messages.log.tip + ' ' + tipUserID, Big(tipAmount).toString());
        log.log_write_database(tipUserID, config.messages.log.tip + ' ' + userID, Big(tipAmount).toString());

        var tipFields = [
            [config.messages.tip.amount, Big(tipAmount).toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
            [config.messages.tip.user, tipUser, true]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.tip.title,tipFields,config.messages.tip.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Rain command
    /* ------------------------------------------------------------------------------ */

    command_rain: async function(msg, userID, messageType, rainType, rainAmount, rainUserCount, activeUsers) {
        // Check if private message
        if(messageType === 1) { // DM
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.private,false,false,false,false);
            return;
        }

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Validate parameters
        if(!rainType || !rainAmount) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Validate amount
        if(!check.check_isNumeric(rainAmount) || Big(rainAmount).lte(0)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(userBalance === false) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(rainAmount)) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,
                config.messages.rain.big + ' ' + Big(rainAmount).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.rain.big1 + ' ' + Big(userBalance).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' ' +
                config.messages.rain.big2,false,false,false,false);
            return;
        }

        var rainUsers = [];
        var rainUsersList = '';
        var actualRainAmount = Big(0);

        if(rainType === 'all') {
            // Rain to all registered users
            var totalUsers = await user.user_get_total_count();
            if(!totalUsers || totalUsers.length === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var userCount = totalUsers[0].totalusers;
            if(userCount <= 1) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + userCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            var amountPerUser = Big(rainAmount).div(userCount);
            
            // Check minimum per user
            if(amountPerUser.lt(config.wallet.minTipValue)) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + userCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Subtract from sender
            var subtractResult = await user.user_substract_balance(rainAmount, userID);
            if(!subtractResult) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add to all users
            var addAllResult = await user.user_add_balance_all(amountPerUser);
            if(!addAllResult) {
                // Try to refund
                await user.user_add_balance(rainAmount, userID);
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            actualRainAmount = Big(amountPerUser).times(userCount);
            rainUsersList = userCount + ' users';

            // Log rain
            log.log_write_database(userID, config.messages.log.rain + ' ' + userCount + ' ' + config.messages.log.rain1, actualRainAmount.toString());

        } else if(rainType === 'online') {
            // Rain to online users
            var onlineUserIds = Object.keys(activeUsers);
            var onlineCount = onlineUserIds.length;
            
            if(onlineCount <= 1) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + onlineCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            var amountPerUser = Big(rainAmount).div(onlineCount);
            
            // Check minimum per user
            if(amountPerUser.lt(config.wallet.minTipValue)) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + onlineCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Subtract from sender
            var subtractResult = await user.user_substract_balance(rainAmount, userID);
            if(!subtractResult) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add to online users
            var successCount = 0;
            for(var i = 0; i < onlineUserIds.length; i++) {
                var onlineUserID = onlineUserIds[i];
                if(onlineUserID !== userID) { // Don't rain to self
                    var addResult = await user.user_add_balance(amountPerUser, onlineUserID);
                    if(addResult) {
                        successCount++;
                        rainUsers.push('<@' + onlineUserID + '>');
                        
                        // Save payment
                        await transaction.transaction_save_payment_to_db(amountPerUser, userID, onlineUserID, config.messages.payment.rain.send);
                    }
                }
            }

            actualRainAmount = Big(amountPerUser).times(successCount);
            rainUsersList = rainUsers.slice(0, config.bot.listUsers).join(', ');
            if(rainUsers.length > config.bot.listUsers) {
                rainUsersList += '...';
            }

            // Log rain
            log.log_write_database(userID, config.messages.log.rain + ' ' + successCount + ' ' + config.messages.log.rain1, actualRainAmount.toString());

        } else if(rainType === 'random') {
            // Rain to random users
            if(!rainUserCount || !check.check_isNumeric(rainUserCount) || parseInt(rainUserCount) <= 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var requestedCount = parseInt(rainUserCount);
            
            // Check maximum random users
            if(requestedCount > config.wallet.maxRainRandomUsers) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.randommax + ' ' + config.wallet.maxRainRandomUsers + ' ' + config.messages.rain.randommax1,false,false,false,false);
                return;
            }

            var amountPerUser = Big(rainAmount).div(requestedCount);
            
            // Check minimum per user
            if(amountPerUser.lt(config.wallet.minTipValue)) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + requestedCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Get random users
            var randomUsers = await user.user_get_discord_ids(requestedCount + 1); // +1 in case sender is included
            if(!randomUsers || randomUsers.length === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Filter out sender
            var filteredUsers = randomUsers.filter(u => u.discord_id !== userID);
            var actualCount = Math.min(filteredUsers.length, requestedCount);
            
            if(actualCount === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + actualCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Subtract from sender
            var actualRainTotal = Big(amountPerUser).times(actualCount);
            var subtractResult = await user.user_substract_balance(actualRainTotal, userID);
            if(!subtractResult) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add to random users
            var successCount = 0;
            for(var i = 0; i < actualCount; i++) {
                var randomUserID = filteredUsers[i].discord_id;
                var addResult = await user.user_add_balance(amountPerUser, randomUserID);
                if(addResult) {
                    successCount++;
                    rainUsers.push('<@' + randomUserID + '>');
                    
                    // Save payment
                    await transaction.transaction_save_payment_to_db(amountPerUser, userID, randomUserID, config.messages.payment.rain.send);
                }
            }

            actualRainAmount = Big(amountPerUser).times(successCount);
            rainUsersList = rainUsers.slice(0, config.bot.listUsers).join(', ');
            if(rainUsers.length > config.bot.listUsers) {
                rainUsersList += '...';
            }

            // Log rain
            log.log_write_database(userID, config.messages.log.rain + ' ' + successCount + ' ' + config.messages.log.rain1, actualRainAmount.toString());

        } else {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        var rainFields = [
            [config.messages.rain.amount, actualRainAmount.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true],
            [config.messages.rain.users, rainUsersList, false]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,rainFields,config.messages.rain.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Drop command - Placeholder (complex implementation needed)
    /* ------------------------------------------------------------------------------ */

    command_drop: async function(msg, userID, messageType, dropType, dropAmount, dropTime, dropPhrase) {
        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.comingSoon,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // History command
    /* ------------------------------------------------------------------------------ */

    command_history: async function(msg, userID, messageType, historyType) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        if(!historyType) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        if(historyType === 'deposits' || historyType === 'd') {
            // Get user deposit address
            var userDepositAddress = await user.user_get_address(userID);
            if(!userDepositAddress) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            // Get deposits
            var deposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory, userDepositAddress);
            if(!deposits || deposits.length === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            var depositFields = [];
            for(var i = 0; i < deposits.length; i++) {
                var deposit = deposits[i];
                var status = deposit.credited ? config.messages.history.deposits.credited : config.messages.history.deposits.pending;
                
                depositFields.push([
                    config.messages.history.deposits.amount + ': ' + Big(deposit.amount).toFixed(8) + ' ' + config.wallet.coinSymbolShort,
                    config.messages.history.deposits.status + ': ' + status + '\n' +
                    config.messages.history.deposits.confirmations + ': ' + deposit.confirmations + '\n' +
                    config.messages.history.deposits.view + ': [' + deposit.txid.substring(0, 16) + '...](' + config.wallet.explorerLinkTransaction + deposit.txid + ')',
                    false
                ]);
            }

            var description = config.messages.history.deposits.description + ' ' + config.wallet.minConfirmationsCredit + ' ' + 
                            config.messages.history.deposits.description1 + ' ' + config.wallet.depositsConfirmationTime + ' ' + 
                            config.messages.history.deposits.description2;

            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,depositFields,description,false,false,false,false);

        } else if(historyType === 'withdrawals' || historyType === 'w') {
            // Get withdrawals
            var withdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount, userID);
            if(!withdrawals || withdrawals.length === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                return;
            }

            var withdrawalFields = [];
            for(var i = 0; i < withdrawals.length; i++) {
                var withdrawal = withdrawals[i];
                
                withdrawalFields.push([
                    Big(withdrawal.amount).toFixed(8) + ' ' + config.wallet.coinSymbolShort + ' → ' + withdrawal.address.substring(0, 16) + '...',
                    '[' + withdrawal.txid.substring(0, 16) + '...](' + config.wallet.explorerLinkTransaction + withdrawal.txid + ')\n' +
                    moment(withdrawal.datetime).format('YYYY-MM-DD HH:mm:ss'),
                    false
                ]);
            }

            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,withdrawalFields,config.messages.history.withdrawals.description,false,false,false,false);

        } else if(historyType === 'payments' || historyType === 'p') {
            // Get payments
            var payments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun, userID);
            if(!payments || payments.length === 0) {
                chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                return;
            }

            var paymentFields = [];
            for(var i = 0; i < payments.length; i++) {
                var payment = payments[i];
                
                paymentFields.push([
                    config.messages.history.payments.type + ': ' + payment.type,
                    config.messages.history.payments.amount + ': ' + Big(payment.amount).toFixed(8) + ' ' + config.wallet.coinSymbolShort + '\n' +
                    moment(payment.datetime).format('YYYY-MM-DD HH:mm:ss'),
                    true
                ]);
            }

            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,paymentFields,config.messages.history.payments.description,false,false,false,false);

        } else {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Update command
    /* ------------------------------------------------------------------------------ */

    command_update: async function(msg, userID, userName, messageType) {
        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        if(!userRegistered) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Update username
        var updateResult = await user.user_update_username(userName, userID);
        if(!updateResult) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Log update
        log.log_write_database(userID, config.messages.log.username + ' ' + userName);

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Donate command
    /* ------------------------------------------------------------------------------ */

    command_donate: async function(msg, userID, messageType) {
        var donateFields = [
            [config.messages.donate.address, config.wallet.donateAddress, false]
        ];

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,donateFields,config.messages.donate.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Stake command - Placeholder (needs staking implementation)
    /* ------------------------------------------------------------------------------ */

    command_stake: async function(msg, userID, messageType, stakeAmount) {
        if(!config.staking.check) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.comingSoon,false,false,false,false);
            return;
        }
        // Staking implementation would go here
        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.comingSoon,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Unstake command - Placeholder (needs staking implementation)
    /* ------------------------------------------------------------------------------ */

    command_unstake: async function(msg, userID, messageType, unstakeAmount) {
        if(!config.staking.check) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.comingSoon,false,false,false,false);
            return;
        }
        // Unstaking implementation would go here
        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.comingSoon,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Notify command
    /* ------------------------------------------------------------------------------ */

    command_notify: async function(msg, userID, messageType, notifyOption) {
        if(!notifyOption) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        var enabled = false;
        var message = '';

        if(notifyOption === 'on') {
            enabled = true;
            message = config.messages.notify.enabled;
        } else if(notifyOption === 'off') {
            enabled = false;
            message = config.messages.notify.disabled;
        } else {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Save notification preference
        var saveResult = await storage.storage_write_local_storage(userID, 'notifications', enabled);
        if(!saveResult) {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,message,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Version command
    /* ------------------------------------------------------------------------------ */

    command_version: async function(msg, userID, messageType) {
        // Get wallet info
        var walletInfo = await wallet.wallet_get_info();
        if(walletInfo === 'error') {
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }

        var versionFields = [
            [config.messages.version.botversion, config.bot.version, true]
        ];

        if(walletInfo && typeof walletInfo === 'object') {
            if(walletInfo.version) {
                versionFields.push([config.messages.version.walletversion, walletInfo.version.toString(), true]);
            }
            if(walletInfo.protocolversion) {
                versionFields.push([config.messages.version.walletprotocolversion, walletInfo.protocolversion.toString(), true]);
            }
            if(walletInfo.connections !== undefined) {
                versionFields.push([config.messages.version.walletconnections, walletInfo.connections.toString(), true]);
            }
            if(walletInfo.blocks) {
                versionFields.push([config.messages.version.walletblocks, walletInfo.blocks.toString(), true]);
            }
            if(walletInfo.difficulty) {
                versionFields.push([config.messages.version.walletdifficulty, walletInfo.difficulty.toString(), true]);
            }
        }

        chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,versionFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Clear command
    /* ------------------------------------------------------------------------------ */

    command_clear: async function(msg, userID, messageType) {
        if(messageType === 1) { // DM
            chat.chat_reply(msg,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.clear.no,false,false,false,false);
            return;
        }

        try {
            // Fetch recent messages and delete them
            const messages = await msg.channel.messages.fetch({ limit: 100 });
            const botMessages = messages.filter(m => m.author.id === globalClient.user.id);
            
            for(const message of botMessages.values()) {
                try {
                    await message.delete();
                } catch(error) {
                    // Ignore individual delete errors
                }
            }
        } catch(error) {
            var errorMessage = "command_clear: Error clearing messages";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Admin: Get deposits
    /* ------------------------------------------------------------------------------ */

    command_get_deposits: async function(manual) {
        try {
            // Get latest deposits from wallet
            var latestDeposits = await wallet.wallet_get_latest_deposits();
            if(!latestDeposits) {
                if(manual) {
                    console.log('Wallet offline or no deposits found');
                }
                return;
            }

            var processedCount = 0;
            
            // Process each deposit
            for(var i = 0; i < latestDeposits.length; i++) {
                var deposit = latestDeposits[i];
                
                // Only process receive transactions
                if(deposit.category === 'receive' && deposit.amount > 0) {
                    var updateResult = await transaction.transaction_add_update_deposits_on_db(
                        deposit.address,
                        deposit.amount,
                        deposit.confirmations,
                        deposit.txid
                    );
                    
                    if(updateResult) {
                        processedCount++;
                    }
                }
            }

            if(manual) {
                if(manual === 1) {
                    console.log(config.messages.getdeposits.manually + ' ' + processedCount + ' ' + config.messages.getdeposits.deposits);
                } else {
                    console.log(config.messages.getdeposits.cron + ' ' + processedCount + ' ' + config.messages.getdeposits.cron2);
                }
            }

        } catch(error) {
            var errorMessage = "command_get_deposits: Error getting deposits";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Admin: Credit deposits
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(manual) {
        try {
            // Get confirmed deposits
            var confirmedDeposits = await transaction.transaction_get_confirmed_deposits();
            if(!confirmedDeposits || confirmedDeposits.length === 0) {
                if(manual) {
                    console.log('No confirmed deposits to credit');
                }
                return;
            }

            var creditedCount = 0;

            // Process each confirmed deposit
            for(var i = 0; i < confirmedDeposits.length; i++) {
                    // Calculate stake reward using wallet-specific method
                    const calculatedReward = await wallet.wallet_calculate_stake_reward(transactionDetails);
                    if(calculatedReward && calculatedReward > 0){
                        transaction_stake = 1;
                        stake_amount = Big(calculatedReward).toString();
                    }
                }
            }

            if(manual) {
                if(manual === 1) {
                    console.log(config.messages.creditdeposits.manually + ' ' + creditedCount + ' ' + config.messages.creditdeposits.deposits);
                } else {
                    console.log(config.messages.creditdeposits.cron + ' ' + creditedCount + ' ' + config.messages.creditdeposits.cron2);
                }
            }

        } catch(error) {
            var errorMessage = "command_credit_deposits: Error crediting deposits";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Admin: Get stakes - Placeholder
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(manual) {
        if(!config.staking.check) {
            return;
        }
        // Staking implementation would go here
        if(manual) {
            console.log('Staking not fully implemented');
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Admin: Credit stakes - Placeholder
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(manual) {
        if(!config.staking.credit) {
            return;
        }
        // Staking implementation would go here
        if(manual) {
            console.log('Staking not fully implemented');
        }
    }

};