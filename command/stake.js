//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

const Big = require('big.js');
const moment = require('moment-timezone');
var chat = require("../functions/chat.js");
var check = require("../functions/check.js");
var log = require("../functions/log.js");
var user = require("../functions/user.js");

module.exports = {
    command_stake: async function(messageFull,userID,userName,messageType,userRole,commandTwo){
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

            // Validate amount parameter
            if(!commandTwo || !check.check_isNumeric(commandTwo) || Big(commandTwo).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var stakeAmount = Big(commandTwo);

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(stakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum stake amount
            if(stakeAmount.lt(config.staking.minStake)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.min + ' ' + config.staking.minStake + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(stakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.stake.big + ' ' + stakeAmount.toString() + ' ' + config.messages.stake.big1 + ' ' + userBalance + ' ' + config.messages.stake.big2,false,false,false,false);
                return;
            }

            // Subtract from normal balance
            var subtractBalance = await user.user_substract_balance(stakeAmount.toString(), userID);
            if(!subtractBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add to stake balance (this also updates unstake_datetime)
            var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            var addStakeBalance = await user.user_add_stake_balance(stakeAmount.toString(), userID, currentDatetime);
            if(!addStakeBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log the stake
            log.log_write_database(userID, config.messages.log.stake, stakeAmount.toString());
            log.log_write_database(userID, config.messages.log.stakeadd, stakeAmount.toString());

            // Build reply
            var replyFields = [];
            replyFields.push([config.messages.stake.amount, stakeAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.stake.title,replyFields,config.messages.stake.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_stake: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};