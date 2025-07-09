//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

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

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Fire command
    /* ------------------------------------------------------------------------------ */

    fire_command: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        try {
            // Check if user is currently blocked (has another task running)
            var userBlocked = storage.storage_read_local_storage(userID,'blocked');
            if(userBlocked){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
                return;
            }

            // Check if command is enabled
            if(!config.commands[commandOne]){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Check user role for command
            if(commandOne === 'startstop' && userRole != 3){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }
            if(commandOne === 'getdeposits' && userRole != 3){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }
            if(commandOne === 'creditdeposits' && userRole != 3){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }
            if(commandOne === 'getstakes' && userRole != 3){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }
            if(commandOne === 'creditstakes' && userRole != 3){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }
            if(commandOne === 'clear' && userRole < 2){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                return;
            }

            // Fire command
            switch(commandOne) {
                case 'h':
                case 'help':
                    this.command_help(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'r':
                case 'register':
                    this.command_register(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'p':
                case 'profile':
                    this.command_profile(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'b':
                case 'balance':
                    this.command_balance(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'd':
                case 'deposit':
                    this.command_deposit(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'w':
                case 'withdraw':
                    this.command_withdraw(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'tip':
                    this.command_tip(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'rain':
                    this.command_rain(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'drop':
                    this.command_drop(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'history':
                    this.command_history(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'u':
                case 'update':
                    this.command_update(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'donate':
                    this.command_donate(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'stake':
                    this.command_stake(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'unstake':
                    this.command_unstake(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'notify':
                    this.command_notify(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'v':
                case 'version':
                    this.command_version(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'getdeposits':
                case 'gd':
                    this.command_get_deposits(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'creditdeposits':
                case 'cd':
                    this.command_credit_deposits(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'getstakes':
                case 'gs':
                    this.command_get_stakes(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'creditstakes':
                case 'cs':
                    this.command_credit_stakes(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                case 'clear':
                case 'c':
                    this.command_clear(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers);
                    break;
                default:
                    //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    break;
            }
        } catch (error) {
            console.error('fire_command: Error processing command', commandOne);
            console.error(error);
            
            var errorMessage = "fire_command: Error processing command " + commandOne;
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Help command
    /* ------------------------------------------------------------------------------ */

    command_help: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        var replyFields = [];
        
        // Normal user commands
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

        // Admin commands
        if(userRole == 3){
            replyFields.push([0,0,false]); // Empty line
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

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.help.title,replyFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Register command
    /* ------------------------------------------------------------------------------ */

    command_register: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is already registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.register.already,false,false,false,false);
            return;
        }

        // Register user
        var userRegister = await user.user_register(check.check_slice_string(userName.username,60),userID);
        if(!userRegister){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Log
        log.log_write_database(userID,config.messages.log.registered);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Profile command
    /* ------------------------------------------------------------------------------ */

    command_profile: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user info
        var userInfo = await user.user_get_info(userID);
        if(!userInfo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        var replyFields = [];
        replyFields.push([config.messages.profile.userid,userInfo[0].id,true]);
        replyFields.push([config.messages.profile.username,userInfo[0].username,true]);
        replyFields.push([config.messages.profile.registered,moment(userInfo[0].register_datetime).format('DD.MM.YYYY HH:mm'),true]);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,replyFields,config.messages.profile.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Balance command
    /* ------------------------------------------------------------------------------ */

    command_balance: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        var replyFields = [];
        replyFields.push([config.messages.balance.balance,Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort,true]);
        replyFields.push([config.messages.balance.username,userName.username,true]);

        // Add stake balance if staking is enabled
        if(config.staking.balanceDisplay){
            var userStakeBalance = await user.user_get_stake_balance(userID);
            if(userStakeBalance){
                replyFields.push([config.messages.balance.stakeTitle,Big(userStakeBalance).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            }
        }

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,replyFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Deposit command
    /* ------------------------------------------------------------------------------ */

    command_deposit: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Get user address
        var userAddress = await user.user_get_address(userID);
        if(!userAddress){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // If user has no address create one
        if(!userAddress){
            // Create deposit address
            var depositAddress = await wallet.wallet_create_deposit_address();
            if(!depositAddress){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Add deposit address to user
            var addDepositAddress = await user.user_add_deposit_address(depositAddress,userID);
            if(!addDepositAddress){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log
            log.log_write_database(userID,config.messages.log.depositaddress + ' ' + depositAddress);

            userAddress = depositAddress;
        }

        var replyFields = [];
        replyFields.push([config.messages.deposit.address,userAddress,false]);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,replyFields,config.messages.deposit.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Withdraw command
    /* ------------------------------------------------------------------------------ */

    command_withdraw: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if address and amount is defined
        if(!commandTwo || !commandThree){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if address is valid
        var addressValid = await wallet.wallet_validate_address(commandTwo);
        if(addressValid === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }
        if(!addressValid){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.notvalid,false,false,false,false);
            return;
        }

        // Check if amount is bigger than minimum
        if(Big(commandThree).lt(config.wallet.minWithdrawalValue)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.min + ' ' + config.wallet.minWithdrawalValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        var withdrawAmountWithFee = Big(commandThree).plus(config.wallet.transactionFee);
        if(Big(userBalance).lt(withdrawAmountWithFee)){
            var maxWithdrawAmount = Big(userBalance).minus(config.wallet.transactionFee);
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.big + ' ' + Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.withdraw.big1 + ' ' + config.wallet.transactionFee + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.withdraw.big2 + ' ' + withdrawAmountWithFee.toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.withdraw.big3 + ' ' + Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.withdraw.big4 + ' ' + maxWithdrawAmount.toString() + ' ' + config.wallet.coinSymbolShort + config.messages.withdraw.big5,false,false,false,false);
            return;
        }

        // Send to address
        var sendToAddress = await wallet.wallet_send_to_address(commandTwo,Big(commandThree).toString());
        if(!sendToAddress){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }

        // Substract balance from user
        var substractBalance = await user.user_substract_balance(withdrawAmountWithFee,userID);
        if(!substractBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
            return;
        }

        // Save withdrawal to database
        var saveWithdrawal = await transaction.transaction_save_withdrawal_to_db(userID,commandTwo,Big(commandThree).toString(),sendToAddress);
        if(!saveWithdrawal){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
            return;
        }

        // Log
        log.log_write_database(userID,config.messages.log.withdrawrequest + ' ' + commandTwo,Big(commandThree).toString());

        var replyFields = [];
        replyFields.push([config.messages.withdraw.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
        replyFields.push([config.messages.withdraw.address,commandTwo,false]);
        replyFields.push([config.messages.withdraw.transaction,config.wallet.explorerLinkTransaction + sendToAddress,false]);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,replyFields,config.messages.withdraw.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Tip command
    /* ------------------------------------------------------------------------------ */

    command_tip: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if its not a private message
        if(messageType === 1){ // 1 = DM
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.private,false,false,false,false);
            return;
        }

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if username and amount is defined
        if(!commandTwo || !commandThree){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if username is valid discord id
        if(!check.check_valid_discord_id(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.notvalid,false,false,false,false);
            return;
        }

        // Get tip user id from discord id
        var tipUserID = commandTwo.replace(/[<@!>]/g, '');

        // Check if user tries to tip himself
        if(tipUserID === userID){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.self,false,false,false,false);
            return;
        }

        // Check if amount is bigger than minimum
        if(Big(commandThree).lt(config.wallet.minTipValue)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.min + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.big + ' ' + Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.tip.big1 + ' ' + Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.tip.big2,false,false,false,false);
            return;
        }

        // Check if tip user is registered
        var tipUserRegistered = await user.user_registered_check(tipUserID);
        if(tipUserRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!tipUserRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.no,false,false,false,false);
            return;
        }

        // Substract balance from user
        var substractBalance = await user.user_substract_balance(commandThree,userID);
        if(!substractBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Add balance to tip user
        var addBalance = await user.user_add_balance(commandThree,tipUserID);
        if(!addBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Save payment to database
        var savePayment = await transaction.transaction_save_payment_to_db(commandThree,userID,tipUserID,config.messages.payment.tip.send);
        var savePayment2 = await transaction.transaction_save_payment_to_db(commandThree,userID,tipUserID,config.messages.payment.tip.received);

        // Log
        log.log_write_database(userID,config.messages.log.tip + ' ' + commandTwo,Big(commandThree).toString());

        var replyFields = [];
        replyFields.push([config.messages.tip.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
        replyFields.push([config.messages.tip.user,commandTwo,true]);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.tip.title,replyFields,config.messages.tip.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Rain command
    /* ------------------------------------------------------------------------------ */

    command_rain: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if its not a private message
        if(messageType === 1){ // 1 = DM
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.private,false,false,false,false);
            return;
        }

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if rain type and amount is defined
        if(!commandTwo || !commandThree){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.big + ' ' + Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.big1 + ' ' + Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.rain.big2,false,false,false,false);
            return;
        }

        // Rain all users
        if(commandTwo === 'all'){
            // Get total user count
            var totalUserCount = await user.user_get_total_count();
            if(!totalUserCount){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var rainUserCount = totalUserCount[0].totalusers;
            var rainAmountPerUser = Big(commandThree).div(rainUserCount);

            // Check if amount per user is bigger than minimum
            if(rainAmountPerUser.lt(config.wallet.minTipValue)){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Substract balance from user
            var substractBalance = await user.user_substract_balance(commandThree,userID);
            if(!substractBalance){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add balance to all users
            var addBalanceAll = await user.user_add_balance_all(rainAmountPerUser.toString());
            if(!addBalanceAll){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Save payment to database
            var savePayment = await transaction.transaction_save_payment_to_db(commandThree,userID,'rainall',config.messages.payment.drop.send);

            // Log
            log.log_write_database(userID,config.messages.log.rain + ' ' + rainUserCount + ' ' + config.messages.log.rain1,Big(commandThree).toString());

            var replyFields = [];
            replyFields.push([config.messages.rain.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.rounded,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.users,rainUserCount,true]);
            replyFields.push([config.messages.rain.each,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
        }

        // Rain online users
        else if(commandTwo === 'online'){
            var rainUserCount = Object.keys(activeUsers).length;
            var rainAmountPerUser = Big(commandThree).div(rainUserCount);

            // Check if amount per user is bigger than minimum
            if(rainAmountPerUser.lt(config.wallet.minTipValue)){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Substract balance from user
            var substractBalance = await user.user_substract_balance(commandThree,userID);
            if(!substractBalance){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add balance to all online users
            for (var key in activeUsers) {
                var addBalance = await user.user_add_balance(rainAmountPerUser.toString(),key);
            }

            // Save payment to database
            var savePayment = await transaction.transaction_save_payment_to_db(commandThree,userID,'rainonline',config.messages.payment.drop.send);

            // Log
            log.log_write_database(userID,config.messages.log.rain + ' ' + rainUserCount + ' ' + config.messages.log.rain1,Big(commandThree).toString());

            var replyFields = [];
            replyFields.push([config.messages.rain.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.rounded,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.users,rainUserCount,true]);
            replyFields.push([config.messages.rain.each,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
        }

        // Rain random users
        else if(commandTwo === 'random'){
            // Check if user count is defined
            if(!commandFour){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check if user count is a number
            if(!check.check_isNumeric(commandFour)){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check if user count is out of javascript integer range
            if(check.check_out_of_int_range(commandFour)){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check if user count is not bigger than max
            if(parseInt(commandFour) > config.wallet.maxRainRandomUsers){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.randommax + ' ' + config.wallet.maxRainRandomUsers + ' ' + config.messages.rain.randommax1,false,false,false,false);
                return;
            }

            var rainUserCount = parseInt(commandFour);
            var rainAmountPerUser = Big(commandThree).div(rainUserCount);

            // Check if amount per user is bigger than minimum
            if(rainAmountPerUser.lt(config.wallet.minTipValue)){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                return;
            }

            // Get random users
            var randomUsers = await user.user_get_discord_ids(rainUserCount);
            if(!randomUsers){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Substract balance from user
            var substractBalance = await user.user_substract_balance(commandThree,userID);
            if(!substractBalance){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add balance to random users
            for (var i = 0 ; i < randomUsers.length ; ++i){
                var addBalance = await user.user_add_balance(rainAmountPerUser.toString(),randomUsers[i].discord_id);
            }

            // Save payment to database
            var savePayment = await transaction.transaction_save_payment_to_db(commandThree,userID,'rainrandom',config.messages.payment.drop.send);

            // Log
            log.log_write_database(userID,config.messages.log.rain + ' ' + rainUserCount + ' ' + config.messages.log.rain1,Big(commandThree).toString());

            var replyFields = [];
            replyFields.push([config.messages.rain.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.rounded,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.users,rainUserCount,true]);
            replyFields.push([config.messages.rain.each,rainAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
        }

        else{
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Drop command
    /* ------------------------------------------------------------------------------ */

    command_drop: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if its not a private message
        if(messageType === 1){ // 1 = DM
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.private,false,false,false,false);
            return;
        }

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if drop type, amount and time is defined
        if(!commandTwo || !commandThree || !commandFour){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if time is a number
        if(!check.check_isNumeric(commandFour)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if time is out of javascript integer range
        if(check.check_out_of_int_range(commandFour)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is bigger than minimum
        if(Big(commandThree).lt(config.wallet.minDropValue)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.min + ' ' + config.wallet.minDropValue + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Check if time is in range
        if(parseInt(commandFour) < config.bot.dropMinSeconds){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.minTime + ' ' + config.bot.dropMinSeconds + '.',false,false,false,false);
            return;
        }
        if(parseInt(commandFour) > config.bot.dropMaxSeconds){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.maxTime + ' ' + config.bot.dropMaxSeconds + '.',false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(commandThree)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.big + ' ' + Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.drop.big1 + ' ' + Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.drop.big2,false,false,false,false);
            return;
        }

        // Drop phrase
        if(commandTwo === 'phrase'){
            // Check if phrase is defined
            if(!commandFive){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Substract balance from user
            var substractBalance = await user.user_substract_balance(commandThree,userID);
            if(!substractBalance){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [];
            replyFields.push([config.messages.drop.phrase,commandFive,false]);
            replyFields.push([config.messages.drop.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.drop.seconds,commandFour,true]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            var dropMessage = chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropPhraseReply,false,false,false,false);

            // Save drop data to local storage
            storage.storage_write_local_storage('drop_' + dropMessage.id,'userID',userID);
            storage.storage_write_local_storage('drop_' + dropMessage.id,'amount',commandThree);
            storage.storage_write_local_storage('drop_' + dropMessage.id,'phrase',commandFive);
            storage.storage_write_local_storage('drop_' + dropMessage.id,'type','phrase');
            storage.storage_write_local_storage('drop_' + dropMessage.id,'users',[]);

            // Set timeout to end drop
            setTimeout(function(){
                this.command_drop_end(dropMessage.id);
            }.bind(this), parseInt(commandFour)*1000);
        }

        // Drop react
        else if(commandTwo === 'react'){
            // Substract balance from user
            var substractBalance = await user.user_substract_balance(commandThree,userID);
            if(!substractBalance){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [];
            replyFields.push([config.messages.drop.icon,config.bot.dropReactIcon,false]);
            replyFields.push([config.messages.drop.amount,Big(commandThree).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.drop.seconds,commandFour,true]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            var dropMessage = chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropReactReply,false,false,false,false);

            // Add reaction to message
            dropMessage.react(config.bot.dropReactIcon);

            // Save drop data to local storage
            storage.storage_write_local_storage('drop_' + dropMessage.id,'userID',userID);
            storage.storage_write_local_storage('drop_' + dropMessage.id,'amount',commandThree);
            storage.storage_write_local_storage('drop_' + dropMessage.id,'type','react');
            storage.storage_write_local_storage('drop_' + dropMessage.id,'users',[]);

            // Set timeout to end drop
            setTimeout(function(){
                this.command_drop_end(dropMessage.id);
            }.bind(this), parseInt(commandFour)*1000);
        }

        else{
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Drop end
    /* ------------------------------------------------------------------------------ */

    command_drop_end: async function(dropMessageID){
        // Get drop data from local storage
        var dropUserID = storage.storage_read_local_storage('drop_' + dropMessageID,'userID');
        var dropAmount = storage.storage_read_local_storage('drop_' + dropMessageID,'amount');
        var dropUsers = storage.storage_read_local_storage('drop_' + dropMessageID,'users');

        if(!dropUserID || !dropAmount || !dropUsers){
            return;
        }

        // Check if minimum users joined
        if(dropUsers.length < config.bot.dropMinUsers){
            // Add balance back to user
            var addBalance = await user.user_add_balance(dropAmount,dropUserID);

            // Delete drop data from local storage
            storage.storage_delete_local_storage('drop_' + dropMessageID,'userID');
            storage.storage_delete_local_storage('drop_' + dropMessageID,'amount');
            storage.storage_delete_local_storage('drop_' + dropMessageID,'phrase');
            storage.storage_delete_local_storage('drop_' + dropMessageID,'type');
            storage.storage_delete_local_storage('drop_' + dropMessageID,'users');

            var replyFields = [];
            replyFields.push([config.messages.drop.minFailedUserTitle,dropUsers.length + ' ' + config.messages.drop.minFailedUser + ' ' + config.bot.dropMinUsers + ' ' + config.messages.drop.minFailedUser1,false]);

            // Get message and edit it
            try{
                var dropMessage = await globalClient.channels.cache.get(config.bot.respondChannelIDs[0]).messages.fetch(dropMessageID);
                var embed = chat.chat_build_reply('embed',false,'guild',config.colors.error,false,config.messages.drop.minFailedUserTitle,replyFields,false,false,false,false,false);
                dropMessage.edit({embeds: [embed]});
            }catch (error){
                console.error('command_drop_end: Error editing drop message');
                console.error(error);
            }

            return;
        }

        var dropAmountPerUser = Big(dropAmount).div(dropUsers.length);

        // Add balance to drop users
        for (var i = 0 ; i < dropUsers.length ; ++i){
            var addBalance = await user.user_add_balance(dropAmountPerUser.toString(),dropUsers[i]);
            var savePayment = await transaction.transaction_save_payment_to_db(dropAmountPerUser.toString(),dropUserID,dropUsers[i],config.messages.payment.drop.received);
        }

        // Save payment to database
        var savePayment = await transaction.transaction_save_payment_to_db(dropAmount,dropUserID,'drop',config.messages.payment.drop.send);

        // Log
        log.log_write_database(dropUserID,config.messages.log.drop + ' ' + dropUsers.length + ' ' + config.messages.log.drop1,Big(dropAmount).toString());

        // Delete drop data from local storage
        storage.storage_delete_local_storage('drop_' + dropMessageID,'userID');
        storage.storage_delete_local_storage('drop_' + dropMessageID,'amount');
        storage.storage_delete_local_storage('drop_' + dropMessageID,'phrase');
        storage.storage_delete_local_storage('drop_' + dropMessageID,'type');
        storage.storage_delete_local_storage('drop_' + dropMessageID,'users');

        var replyFields = [];
        replyFields.push([config.messages.drop.amount,Big(dropAmount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
        replyFields.push([config.messages.drop.rounded,dropAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);
        replyFields.push([config.messages.drop.users,dropUsers.length,true]);
        replyFields.push([config.messages.drop.each,dropAmountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);

        // Get message and edit it
        try{
            var dropMessage = await globalClient.channels.cache.get(config.bot.respondChannelIDs[0]).messages.fetch(dropMessageID);
            var embed = chat.chat_build_reply('embed',false,'guild',config.colors.success,false,config.messages.drop.titleSent,replyFields,config.messages.drop.description,false,false,false,false);
            dropMessage.edit({embeds: [embed]});
        }catch (error){
            console.error('command_drop_end: Error editing drop message');
            console.error(error);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // History command
    /* ------------------------------------------------------------------------------ */

    command_history: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if history type is defined
        if(!commandTwo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Deposits history
        if(commandTwo === 'deposits' || commandTwo === 'd'){
            // Get user address
            var userAddress = await user.user_get_address(userID);
            if(!userAddress){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            // Get deposits
            var userDeposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory,userAddress);
            if(!userDeposits){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            if(userDeposits.length === 0){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for (var i = 0 ; i < userDeposits.length ; ++i){
                var depositStatus = config.messages.history.deposits.pending;
                if(userDeposits[i].credited == 1){
                    depositStatus = config.messages.history.deposits.credited;
                }
                replyFields.push([config.messages.history.deposits.amount,Big(userDeposits[i].amount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
                replyFields.push([config.messages.history.deposits.status,depositStatus,true]);
                replyFields.push([config.messages.history.deposits.confirmations,userDeposits[i].confirmations,true]);
                replyFields.push([config.messages.history.deposits.view,config.wallet.explorerLinkTransaction + userDeposits[i].txid,false]);
                if(i < userDeposits.length-1){
                    replyFields.push([0,0,false]); // Empty line
                }
            }

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,replyFields,config.messages.history.deposits.description + ' ' + config.wallet.minConfirmationsCredit + ' ' + config.messages.history.deposits.description1 + ' ' + config.wallet.depositsConfirmationTime + ' ' + config.messages.history.deposits.description2,false,false,false,false);
        }

        // Withdrawals history
        else if(commandTwo === 'withdrawals' || commandTwo === 'w'){
            // Get withdrawals
            var userWithdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount,userID);
            if(!userWithdrawals){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            if(userWithdrawals.length === 0){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for (var i = 0 ; i < userWithdrawals.length ; ++i){
                replyFields.push([config.messages.withdraw.amount,Big(userWithdrawals[i].amount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
                replyFields.push([config.messages.withdraw.address,userWithdrawals[i].address,false]);
                replyFields.push([config.messages.withdraw.transaction,config.wallet.explorerLinkTransaction + userWithdrawals[i].txid,false]);
                if(i < userWithdrawals.length-1){
                    replyFields.push([0,0,false]); // Empty line
                }
            }

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,replyFields,config.messages.history.withdrawals.description,false,false,false,false);
        }

        // Payments history
        else if(commandTwo === 'payments' || commandTwo === 'p'){
            // Get payments
            var userPayments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun,userID);
            if(!userPayments){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            if(userPayments.length === 0){
                // Unblock user
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for (var i = 0 ; i < userPayments.length ; ++i){
                replyFields.push([config.messages.history.payments.type,userPayments[i].type,true]);
                replyFields.push([config.messages.history.payments.amount,Big(userPayments[i].amount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
                if(i < userPayments.length-1){
                    replyFields.push([0,0,false]); // Empty line
                }
            }

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,replyFields,config.messages.history.payments.description,false,false,false,false);
        }

        else{
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Update command
    /* ------------------------------------------------------------------------------ */

    command_update: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Update username
        var updateUsername = await user.user_update_username(check.check_slice_string(userName.username,60),userID);
        if(!updateUsername){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Log
        log.log_write_database(userID,config.messages.log.username + ' ' + userName.username);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Donate command
    /* ------------------------------------------------------------------------------ */

    command_donate: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        var replyFields = [];
        replyFields.push([config.messages.donate.address,config.wallet.donateAddress,false]);

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,replyFields,config.messages.donate.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Stake command
    /* ------------------------------------------------------------------------------ */

    command_stake: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if amount is defined
        if(!commandTwo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is bigger than minimum
        if(Big(commandTwo).lt(config.staking.minStake)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.stake.min + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough balance
        if(Big(userBalance).lt(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.stake.big + ' ' + Big(commandTwo).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.stake.big1 + ' ' + Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.stake.big2,false,false,false,false);
            return;
        }

        // Substract balance from user
        var substractBalance = await user.user_substract_balance(commandTwo,userID);
        if(!substractBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Add stake balance to user
        var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
        var addStakeBalance = await user.user_add_stake_balance(commandTwo,userID,currentDatetime);
        if(!addStakeBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Save payment to database
        var savePayment = await transaction.transaction_save_payment_to_db(commandTwo,userID,userID,config.messages.payment.stake.stake);

        // Log
        log.log_write_database(userID,config.messages.log.stakeadd,Big(commandTwo).toString());

        var replyFields = [];
        replyFields.push([config.messages.stake.amount,Big(commandTwo).toString() + ' ' + config.wallet.coinSymbolShort,true]);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.stake.title,replyFields,config.messages.stake.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Unstake command
    /* ------------------------------------------------------------------------------ */

    command_unstake: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if amount is defined
        if(!commandTwo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is a number
        if(!check.check_isNumeric(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is out of javascript integer range
        if(check.check_out_of_int_range(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Check if amount is bigger than minimum
        if(Big(commandTwo).lt(config.staking.minUnstake)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.unstake.min + ' ' + config.staking.minUnstake + ' ' + config.wallet.coinSymbolShort + '.',false,false,false,false);
            return;
        }

        // Get user stake balance
        var userStakeBalance = await user.user_get_stake_balance(userID);
        if(!userStakeBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user has enough stake balance
        if(Big(userStakeBalance).lt(commandTwo)){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.unstake.big + ' ' + Big(commandTwo).toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.unstake.big1 + ' ' + Big(userStakeBalance).toString() + ' ' + config.wallet.coinSymbolShort + config.messages.unstake.big2,false,false,false,false);
            return;
        }

        // Get user info to check unstake time
        var userInfo = await user.user_get_info(userID);
        if(!userInfo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Check if user can unstake (lock time)
        var currentDatetime = moment().tz(config.staking.timezone);
        var unstakeDatetime = moment(userInfo[0].unstake_datetime).tz(config.staking.timezone);
        var lockTimeEnd = unstakeDatetime.add(config.staking.lockTime, 'seconds');
        
        if(currentDatetime.isBefore(lockTimeEnd)){
            var timeLeft = moment.duration(lockTimeEnd.diff(currentDatetime));
            var days = Math.floor(timeLeft.asDays());
            var hours = timeLeft.hours();
            var minutes = timeLeft.minutes();
            var seconds = timeLeft.seconds();

            var timeLeftString = '';
            if(days > 0) timeLeftString += days + ' ' + config.messages.unstake.leftdays + ' ';
            if(hours > 0) timeLeftString += hours + ' ' + config.messages.unstake.lefthours + ' ';
            if(minutes > 0) timeLeftString += minutes + ' ' + config.messages.unstake.leftminutes + ' ';
            if(seconds > 0) timeLeftString += seconds + ' ' + config.messages.unstake.leftseconds;

            var replyFields = [];
            replyFields.push([config.messages.unstake.locked,config.messages.unstake.left + ' ' + timeLeftString + config.messages.unstake.left2,false]);

            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,replyFields,false,false,false,false,false);
            return;
        }

        // Check if remaining stake balance would be below minimum
        var remainingStakeBalance = Big(userStakeBalance).minus(commandTwo);
        var unstakeAmount = commandTwo;
        
        if(remainingStakeBalance.gt(0) && remainingStakeBalance.lt(config.staking.minStake)){
            // Transfer all stake balance instead
            unstakeAmount = userStakeBalance;
            var replyFields = [];
            replyFields.push([config.messages.unstake.amount,Big(unstakeAmount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.unstake.rest,config.messages.unstake.rest + ' ' + remainingStakeBalance.toString() + ' ' + config.wallet.coinSymbolShort + ' ' + config.messages.unstake.rest2 + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort + config.messages.unstake.rest3,false]);
        } else {
            var replyFields = [];
            replyFields.push([config.messages.unstake.amount,Big(unstakeAmount).toString() + ' ' + config.wallet.coinSymbolShort,true]);
        }

        // Substract stake balance from user
        var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
        var substractStakeBalance = await user.user_substract_stake_balance(unstakeAmount,userID,currentDatetime);
        if(!substractStakeBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Add balance to user
        var addBalance = await user.user_add_balance(unstakeAmount,userID);
        if(!addBalance){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Save payment to database
        var savePayment = await transaction.transaction_save_payment_to_db(unstakeAmount,userID,userID,config.messages.payment.stake.unstake);

        // Log
        log.log_write_database(userID,config.messages.log.unstakeadd,Big(unstakeAmount).toString());

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.unstake.title,replyFields,config.messages.unstake.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Notify command
    /* ------------------------------------------------------------------------------ */

    command_notify: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Check if user is registered
        var userRegistered = await user.user_registered_check(userID);
        if(userRegistered === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!userRegistered){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }

        // Check if setting is defined
        if(!commandTwo){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        var notifyEnabled = false;
        var replyMessage = config.messages.notify.disabled;

        if(commandTwo === 'on'){
            notifyEnabled = true;
            replyMessage = config.messages.notify.enabled;
        } else if(commandTwo === 'off'){
            notifyEnabled = false;
            replyMessage = config.messages.notify.disabled;
        } else {
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }

        // Save notification setting to local storage
        storage.storage_write_local_storage(userID,'notify',notifyEnabled);

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,replyMessage,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Version command
    /* ------------------------------------------------------------------------------ */

    command_version: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Get wallet info
        var walletInfo = await wallet.wallet_get_info();
        if(walletInfo === 'error'){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }

        var replyFields = [];
        replyFields.push([config.messages.version.botversion,config.bot.version,true]);
        
        // Handle different wallet info structures
        if(walletInfo.version){
            replyFields.push([config.messages.version.walletversion,walletInfo.version,true]);
        }
        if(walletInfo.protocolversion){
            replyFields.push([config.messages.version.walletprotocolversion,walletInfo.protocolversion,true]);
        }
        if(walletInfo.connections !== undefined){
            replyFields.push([config.messages.version.walletconnections,walletInfo.connections,true]);
        }
        if(walletInfo.blocks){
            replyFields.push([config.messages.version.walletblocks,walletInfo.blocks,true]);
        }
        if(walletInfo.difficulty){
            replyFields.push([config.messages.version.walletdifficulty,walletInfo.difficulty,true]);
        }

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,replyFields,false,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Get deposits command (admin)
    /* ------------------------------------------------------------------------------ */

    command_get_deposits: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user
        storage.storage_write_local_storage(userID,'blocked',1);

        // Get latest deposits from wallet
        var latestDeposits = await wallet.wallet_get_latest_deposits();
        if(!latestDeposits){
            // Unblock user
            storage.storage_delete_local_storage(userID,'blocked');
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }

        var updatedDeposits = 0;

        // Process deposits
        for (var i = 0 ; i < latestDeposits.length ; ++i){
            if(latestDeposits[i].category === 'receive' && latestDeposits[i].confirmations <= config.wallet.minConfirmationsDeposit){
                var addUpdateDeposit = await transaction.transaction_add_update_deposits_on_db(latestDeposits[i].address,latestDeposits[i].amount,latestDeposits[i].confirmations,latestDeposits[i].txid);
                if(addUpdateDeposit){
                    updatedDeposits++;
                }
            }
        }

        // Unblock user
        storage.storage_delete_local_storage(userID,'blocked');

        var replyMessage = '';
        if(messageFull){
            replyMessage = config.messages.getdeposits.manually + ' ' + updatedDeposits + ' ' + config.messages.getdeposits.deposits + '.';
        } else {
            replyMessage = config.messages.getdeposits.cron + ' ' + updatedDeposits + ' ' + config.messages.getdeposits.cron2 + '.';
        }

        if(messageFull){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
        } else {
            console.log(replyMessage);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit deposits command (admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user if called from message
        if(messageFull){
            storage.storage_write_local_storage(userID,'blocked',1);
        }

        // Get confirmed deposits
        var confirmedDeposits = await transaction.transaction_get_confirmed_deposits();
        if(!confirmedDeposits){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
            return;
        }

        var creditedDeposits = 0;

        // Process confirmed deposits
        for (var i = 0 ; i < confirmedDeposits.length ; ++i){
            // Get user id by address
            var getUserID = await user.user_get_id_by_address(confirmedDeposits[i].address);
            if(getUserID && getUserID !== 'notregisteredaddress'){
                // Credit balance to user
                var creditBalance = await user.user_credit_balance(confirmedDeposits[i].address,confirmedDeposits[i].amount);
                if(creditBalance){
                    // Set deposit as credited
                    var setDepositCredited = await transaction.transaction_set_deposit_confirmed(confirmedDeposits[i].id);
                    if(setDepositCredited){
                        creditedDeposits++;
                        // Log
                        log.log_write_database(getUserID,config.messages.log.transctioncredited + ' ' + confirmedDeposits[i].address,Big(confirmedDeposits[i].amount).toString());
                    }
                }
            } else {
                // Set deposit as credited even if user not found to prevent endless loop
                var setDepositCredited = await transaction.transaction_set_deposit_confirmed(confirmedDeposits[i].id);
                if(setDepositCredited){
                    creditedDeposits++;
                    // Log unknown address
                    log.log_write_database('unknown',config.messages.log.transctioncreditedunknown + ' ' + confirmedDeposits[i].address,Big(confirmedDeposits[i].amount).toString());
                }
            }
        }

        // Unblock user if called from message
        if(messageFull){
            storage.storage_delete_local_storage(userID,'blocked');
        }

        var replyMessage = '';
        if(messageFull){
            replyMessage = config.messages.creditdeposits.manually + ' ' + creditedDeposits + ' ' + config.messages.creditdeposits.deposits + '.';
        } else {
            replyMessage = config.messages.creditdeposits.cron + ' ' + creditedDeposits + ' ' + config.messages.creditdeposits.cron2 + '.';
        }

        if(messageFull){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
        } else {
            console.log(replyMessage);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Get stakes command (admin)
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user if called from message
        if(messageFull){
            storage.storage_write_local_storage(userID,'blocked',1);
        }

        // Get stake transactions
        var stakeTransactions = await transaction.transaction_get_stake_transactions();
        if(!stakeTransactions){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
            return;
        }

        var checkedTransactions = 0;

        // Process stake transactions
        for (var i = 0 ; i < stakeTransactions.length ; ++i){
            try {
                // Get transaction details
                var transactionDetails = await wallet.wallet_get_transaction(stakeTransactions[i].txid);
                if(transactionDetails){
                    // Calculate stake reward using the new wallet-aware function
                    var stakeReward = await wallet.wallet_calculate_stake_reward(transactionDetails);
                    
                    var isStake = 0;
                    var stakeAmount = 0;
                    
                    if(stakeReward !== null && stakeReward > 0){
                        isStake = 1;
                        stakeAmount = stakeReward;
                        
                        if(config.staking.debug){
                            console.log(`Stake found: ${stakeTransactions[i].txid} - Reward: ${stakeAmount}`);
                        }
                    }
                    
                    // Update transaction
                    var updateTransaction = await transaction.transaction_update_stake_transaction(stakeTransactions[i].txid, stakeAmount, isStake);
                    if(updateTransaction){
                        checkedTransactions++;
                    }
                }
            } catch (error) {
                console.error('Error processing stake transaction:', stakeTransactions[i].txid, error);
                // Mark as checked even if error to prevent endless loop
                var updateTransaction = await transaction.transaction_update_stake_transaction(stakeTransactions[i].txid, 0, 0);
                if(updateTransaction){
                    checkedTransactions++;
                }
            }
        }

        // Unblock user if called from message
        if(messageFull){
            storage.storage_delete_local_storage(userID,'blocked');
        }

        var replyMessage = '';
        if(messageFull){
            replyMessage = config.messages.getstakes.manually + ' ' + checkedTransactions + ' ' + config.messages.getstakes.transactions + '.';
        } else {
            replyMessage = config.messages.getstakes.cron + ' ' + checkedTransactions + ' ' + config.messages.getstakes.cron2 + '.';
        }

        if(messageFull){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
        } else {
            console.log(replyMessage);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit stakes command (admin)
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Block user if called from message
        if(messageFull){
            storage.storage_write_local_storage(userID,'blocked',1);
        }

        // Get stake transactions to credit
        var stakeTransactionsToCredit = await transaction.transaction_get_stake_transactions_to_credit();
        if(!stakeTransactionsToCredit){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
            return;
        }

        if(stakeTransactionsToCredit.length === 0){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
            }
            
            var replyMessage = '';
            if(messageFull){
                replyMessage = config.messages.creditstakes.manually + ' 0 ' + config.messages.creditstakes.transactions + '.';
            } else {
                replyMessage = config.messages.creditstakes.cron + ' 0 ' + config.messages.creditstakes.cron2 + '.';
            }

            if(messageFull){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
            } else {
                console.log(replyMessage);
            }
            return;
        }

        // Get wallet balance
        var walletBalance = await wallet.wallet_get_balance();
        if(!walletBalance){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            }
            return;
        }

        // Get all stake users
        var stakeUsers = await user.user_get_stake_users();
        if(!stakeUsers){
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
            return;
        }

        if(stakeUsers.length === 0){
            // Mark transactions as credited even if no users to prevent endless loop
            var highestTransactionID = Math.max(...stakeTransactionsToCredit.map(tx => tx.id));
            var updateTransactionsCredited = await transaction.transaction_update_stake_transaction_credited(highestTransactionID);
            
            // Unblock user if called from message
            if(messageFull){
                storage.storage_delete_local_storage(userID,'blocked');
            }
            
            var replyMessage = '';
            if(messageFull){
                replyMessage = config.messages.creditstakes.manually + ' 0 ' + config.messages.creditstakes.transactions + ' (no stake users).';
            } else {
                replyMessage = config.messages.creditstakes.cron + ' 0 ' + config.messages.creditstakes.cron2 + ' (no stake users).';
            }

            if(messageFull){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
            } else {
                console.log(replyMessage);
            }
            return;
        }

        // Calculate total stake amount from transactions
        var totalStakeAmount = Big(0);
        for (var i = 0 ; i < stakeTransactionsToCredit.length ; ++i){
            totalStakeAmount = totalStakeAmount.plus(stakeTransactionsToCredit[i].amount);
        }

        // Calculate total stake amount for users (minus developer percentage)
        var totalStakeForStakers = totalStakeAmount.times(Big(100).minus(config.staking.ownerPercentage)).div(100);

        // Calculate total user stake balance
        var totalUserStakeBalance = Big(0);
        for (var i = 0 ; i < stakeUsers.length ; ++i){
            totalUserStakeBalance = totalUserStakeBalance.plus(stakeUsers[i].stake_balance);
        }

        // Debug logging
        if(config.staking.debug){
            console.log(config.messages.log.stakecredit + ' ' + walletBalance);
            console.log(config.messages.log.stakecredit1 + ' ' + totalStakeAmount.toString());
            console.log(config.messages.log.stakecredit2 + ' ' + totalStakeForStakers.toString());
            console.log(config.messages.log.stakecredit3 + ' ' + stakeUsers.length);
            console.log(config.messages.log.stakecredit4);
            for (var i = 0 ; i < stakeUsers.length ; ++i){
                console.log('- ' + stakeUsers[i].discord_id + ': ' + stakeUsers[i].stake_balance);
            }
            console.log(config.messages.log.stakecredit5 + ' ' + totalUserStakeBalance.toString());
            console.log(config.messages.log.stakecredit6 + ' ' + totalUserStakeBalance.div(walletBalance).times(totalStakeForStakers).toString());
            console.log(config.messages.log.stakecredit7);
            for (var i = 0 ; i < stakeTransactionsToCredit.length ; ++i){
                console.log('- ' + stakeTransactionsToCredit[i].id + ': ' + stakeTransactionsToCredit[i].txid + ' (' + stakeTransactionsToCredit[i].amount + ')');
            }
        }

        // Calculate total value for stake users from the total stake amount
        var totalValueForStakeUsers = totalUserStakeBalance.div(walletBalance).times(totalStakeForStakers);

        var creditedStakes = 0;

        // Credit stakes to users
        for (var i = 0 ; i < stakeUsers.length ; ++i){
            // Calculate user's share of the total stake reward
            var userStakePercentage = Big(stakeUsers[i].stake_balance).div(totalUserStakeBalance);
            var userCreditAmount = totalValueForStakeUsers.times(userStakePercentage);

            if(config.staking.debug){
                console.log(config.messages.log.stakecredit8 + ' ' + stakeUsers[i].discord_id);
                console.log(config.messages.log.stakecredit9 + ' ' + stakeUsers[i].stake_balance);
                console.log(config.messages.log.stakecredit10 + ' ' + userCreditAmount.toString());
            }

            // Add balance to user
            var addBalance = await user.user_add_balance(userCreditAmount.toString(),stakeUsers[i].discord_id);
            if(addBalance){
                // Save payment to database
                var savePayment = await transaction.transaction_save_payment_to_db(userCreditAmount.toString(),config.bot.botID,stakeUsers[i].discord_id,config.messages.payment.stake.received);
                creditedStakes++;
            }
        }

        // Mark transactions as credited
        var highestTransactionID = Math.max(...stakeTransactionsToCredit.map(tx => tx.id));
        var updateTransactionsCredited = await transaction.transaction_update_stake_transaction_credited(highestTransactionID);

        // Send pool payout message to stake pool channel
        if(config.bot.stakePoolChannelID && totalStakeAmount.gt(0)){
            var replyFields = [];
            replyFields.push([config.messages.creditstakes.stakes,totalStakeAmount.toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.creditstakes.amount,totalStakeForStakers.toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.creditstakes.users,creditedStakes,true]);

            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(false,'pool',false,'guild',config.colors.success,false,config.messages.creditstakes.title,replyFields,config.messages.creditstakes.description,false,false,false,false);
        }

        // Unblock user if called from message
        if(messageFull){
            storage.storage_delete_local_storage(userID,'blocked');
        }

        var replyMessage = '';
        if(messageFull){
            replyMessage = config.messages.creditstakes.manually + ' ' + creditedStakes + ' ' + config.messages.creditstakes.transactions + '.';
        } else {
            replyMessage = config.messages.creditstakes.cron + ' ' + creditedStakes + ' ' + config.messages.creditstakes.cron2 + '.';
        }

        if(messageFull){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage,false,false,false,false);
        } else {
            console.log(replyMessage);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear command (moderator)
    /* ------------------------------------------------------------------------------ */

    command_clear: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        // Check if its not a private message
        if(messageType === 1){ // 1 = DM
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.clear.no,false,false,false,false);
            return;
        }

        // Delete messages
        messageFull.channel.messages.fetch({ limit: 100 }).then(messages => {
            messageFull.channel.bulkDelete(messages);
        }).catch(console.error);
    }

};