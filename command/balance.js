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
var user = require("../functions/user.js");

module.exports = {
    command_balance: async function(messageFull,userID,userName,messageType,userRole){
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

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [];
            replyFields.push([config.messages.balance.username,userName.username.toString(),true]);
            replyFields.push([config.messages.balance.balance,Big(userBalance).toString() + ' ' + config.wallet.coinSymbolShort,true]);

            // Add stake balance if staking is enabled
            if(config.staking.balanceDisplay){
                var userStakeBalance = await user.user_get_stake_balance(userID);
                if(userStakeBalance !== false){
                    replyFields.push([config.messages.balance.stakeTitle,Big(userStakeBalance).toString() + ' ' + config.wallet.coinSymbolShort,true]);
                }
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.balance.balance,replyFields,'',false,false,false,false);
            
        } catch (error) {
            console.error('command_balance: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};