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
    command_tip: async function(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree){
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.private,false,false,false,false);
                return;
            }

            // Validate user parameter
            if(!commandTwo || !check.check_valid_discord_id(commandTwo)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.notvalid,false,false,false,false);
                return;
            }

            // Validate amount parameter
            if(!commandThree || !check.check_isNumeric(commandThree) || Big(commandThree).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var tipAmount = Big(commandThree);

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(tipAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum tip amount
            if(tipAmount.lt(config.wallet.minTipValue)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.min + ' ' + config.wallet.minTipValue + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Extract user ID from Discord mention
            var tipToUserID = commandTwo.replace(/[<@!>]/g, '');

            // Check if user is trying to tip themselves
            if(tipToUserID === userID){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.self,false,false,false,false);
                return;
            }

            // Check if tip recipient is registered
            var tipUserRegistered = await user.user_registered_check(tipToUserID);
            if(tipUserRegistered === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            
            if(!tipUserRegistered){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.no,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(tipAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.tip.big + ' ' + tipAmount.toString() + ' ' + config.messages.tip.big1 + ' ' + userBalance + ' ' + config.messages.tip.big2,false,false,false,false);
                return;
            }

            // Subtract balance from sender
            var subtractBalance = await user.user_substract_balance(tipAmount.toString(), userID);
            if(!subtractBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add balance to recipient
            var addBalance = await user.user_add_balance(tipAmount.toString(), tipToUserID);
            if(!addBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Save payment record
            var savePayment = await transaction.transaction_save_payment_to_db(tipAmount.toString(), userID, tipToUserID, config.messages.payment.tip.send);
            if(!savePayment){
                console.log('Failed to save tip payment record');
            }

            // Log the tip
            log.log_write_database(userID, config.messages.log.tip + ' ' + tipToUserID, tipAmount.toString());

            // Build reply
            var replyFields = [];
            replyFields.push([config.messages.tip.amount, tipAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);
            replyFields.push([config.messages.tip.user, commandTwo, true]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.tip.title,replyFields,config.messages.tip.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_tip: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};