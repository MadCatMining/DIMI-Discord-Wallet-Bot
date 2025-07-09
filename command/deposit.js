//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("../functions/chat.js");
var log = require("../functions/log.js");
var user = require("../functions/user.js");
var wallet = require("../functions/wallet.js");

module.exports = {
    command_deposit: async function(messageFull,userID,userName,messageType,userRole){
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

            // Get user deposit address
            var userDepositAddress = await user.user_get_address(userID);
            if(userDepositAddress === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // If no address exists, create one
            if(!userDepositAddress){
                var newDepositAddress = await wallet.wallet_create_deposit_address();
                if(!newDepositAddress){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                    return;
                }

                // Save address to database
                var saveAddress = await user.user_add_deposit_address(newDepositAddress,userID);
                if(!saveAddress){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }

                userDepositAddress = newDepositAddress;
                log.log_write_database(userID,config.messages.log.depositaddress);
            }

            var replyFields = [];
            replyFields.push([config.messages.deposit.address,userDepositAddress.toString(),false]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.deposit.title,replyFields,config.messages.deposit.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_deposit: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};