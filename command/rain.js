//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

const Big = require('big.js');
var chat = require("../functions/chat.js");
var check = require("../functions/check.js");
var log = require("../functions/log.js");
var transaction = require("../functions/transaction.js");
var user = require("../functions/user.js");

module.exports = {
    command_rain: async function(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,serverUsers,activeUsers){
        try {
            // Check if user is registered
            var userRegistered = await user.user_registered_check(userID);
            if(userRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!userRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.accountNotRegistered,false,false,false,false);
                return;
            }

            // Check if command is used in private message
            if(messageType === 1){ // DM
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.private,false,false,false,false);
                return;
            }

            // Validate rain type
            if(!commandTwo || (commandTwo !== 'all' && commandTwo !== 'online' && commandTwo !== 'random')){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount
            if(!commandThree || !check.check_isNumeric(commandThree) || Big(commandThree).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var rainAmount = Big(commandThree);

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(rainAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(rainAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.big + ' ' + rainAmount.toString() + ' ' + config.messages.rain.big1 + ' ' + userBalance + ' ' + config.messages.rain.big2,false,false,false,false);
                return;
            }

            var rainUsers = [];
            var rainUserCount = 0;
            var amountPerUser = Big(0);

            if(commandTwo === 'all'){
                // Rain to all registered users
                var totalUsers = await user.user_get_total_count();
                if(!totalUsers || totalUsers.length === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                rainUserCount = totalUsers[0].totalusers;
                amountPerUser = rainAmount.div(rainUserCount);

                // Check minimum amount per user
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Add balance to all users
                var addBalanceAll = await user.user_add_balance_all(amountPerUser.toString());
                if(!addBalanceAll){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Save payment record
                await transaction.transaction_save_payment_to_db(rainAmount.toString(),userID,'rainall',config.messages.payment.drop.send);

            } else if(commandTwo === 'online'){
                // Rain to online users
                var onlineUserIds = Object.keys(activeUsers);
                
                // Filter out the sender and ensure all users are registered
                var validOnlineUsers = [];
                for(var i = 0; i < onlineUserIds.length; i++){
                    var onlineUserId = onlineUserIds[i];
                    if(onlineUserId !== userID){ // Don't rain to self
                        var isRegistered = await user.user_registered_check(onlineUserId);
                        if(isRegistered === true){
                            validOnlineUsers.push(onlineUserId);
                        }
                    }
                }
                
                rainUserCount = validOnlineUsers.length;

                if(rainUserCount === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,'No online users found.',false,false,false,false);
                    return;
                }

                amountPerUser = rainAmount.div(rainUserCount);

                // Check minimum amount per user
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Add balance to each online user
                for(var i = 0; i < validOnlineUsers.length; i++){
                    var onlineUserId = validOnlineUsers[i];
                    var addBalance = await user.user_add_balance(amountPerUser.toString(), onlineUserId);
                    if(addBalance){
                        await transaction.transaction_save_payment_to_db(amountPerUser.toString(),userID,onlineUserId,config.messages.payment.drop.received);
                        rainUsers.push(onlineUserId);
                    }
                }

            } else if(commandTwo === 'random'){
                // Rain to random users
                if(!commandFour || !check.check_isNumeric(commandFour) || parseInt(commandFour) <= 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }

                rainUserCount = parseInt(commandFour);

                // Check maximum random users
                if(rainUserCount > config.wallet.maxRainRandomUsers){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.randommax + ' ' + config.wallet.maxRainRandomUsers + ' ' + config.messages.rain.randommax1,false,false,false,false);
                    return;
                }

                amountPerUser = rainAmount.div(rainUserCount);

                // Check minimum amount per user
                if(amountPerUser.lt(config.wallet.minTipValue)){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.rain.minimum + ' ' + config.wallet.minTipValue + ' ' + config.messages.rain.minimum1 + ' ' + rainUserCount + ' ' + config.messages.rain.minimum2,false,false,false,false);
                    return;
                }

                // Get random users
                var randomUsers = await user.user_get_discord_ids(rainUserCount);
                if(!randomUsers || randomUsers.length === 0){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                // Add balance to each random user
                for(var i = 0; i < randomUsers.length; i++){
                    var randomUserId = randomUsers[i].discord_id;
                    if(randomUserId !== userID){ // Don't rain to self
                        var addBalance = await user.user_add_balance(amountPerUser.toString(), randomUserId);
                        if(addBalance){
                            await transaction.transaction_save_payment_to_db(amountPerUser.toString(),userID,randomUserId,config.messages.payment.drop.received);
                            rainUsers.push(randomUserId);
                        }
                    }
                }
            }

            // Subtract balance from sender
            var subtractBalance = await user.user_substract_balance(rainAmount.toString(), userID);
            if(!subtractBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log the rain
            log.log_write_database(userID,config.messages.log.rain + ' ' + rainUserCount + ' ' + config.messages.log.rain1,rainAmount.toString());

            // Build reply
            var replyFields = [];
            replyFields.push([config.messages.rain.amount,rainAmount.toString() + ' ' + config.wallet.coinSymbolShort,true]);
            replyFields.push([config.messages.rain.users,rainUserCount.toString(),true]);
            replyFields.push([config.messages.rain.each,amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort,true]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.rain.title,replyFields,config.messages.rain.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_rain: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};