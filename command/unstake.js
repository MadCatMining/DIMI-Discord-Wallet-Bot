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
    command_unstake: async function(messageFull,userID,userName,messageType,userRole,commandTwo){
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

            var unstakeAmount = Big(commandTwo);

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(unstakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum unstake amount
            if(unstakeAmount.lt(config.staking.minUnstake)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.min + ' ' + config.staking.minUnstake + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Get user info to check unstake datetime and stake balance
            var userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var userStakeBalance = Big(userInfo[0].stake_balance);
            var lastUnstakeTime = moment(userInfo[0].unstake_datetime);
            var currentTime = moment().tz(config.staking.timezone);

            // Check if user has enough stake balance
            if(userStakeBalance.lt(unstakeAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.big + ' ' + unstakeAmount.toString() + ' ' + config.messages.unstake.big1 + ' ' + userStakeBalance.toString() + ' ' + config.messages.unstake.big2,false,false,false,false);
                return;
            }

            // Check lock time (if user has staked/unstaked recently)
            var timeDiff = currentTime.diff(lastUnstakeTime, 'seconds');
            if(timeDiff < config.staking.lockTime){
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

                var replyFields = [];
                replyFields.push([config.messages.unstake.locked, config.messages.unstake.left + ' ' + timeString.trim() + ' ' + config.messages.unstake.left2, false]);

                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,replyFields,'',false,false,false,false);
                return;
            }

            // Check if remaining stake balance would be below minimum
            var remainingStakeBalance = userStakeBalance.minus(unstakeAmount);
            if(remainingStakeBalance.gt(0) && remainingStakeBalance.lt(config.staking.minStake)){
                // Transfer all stake balance instead
                unstakeAmount = userStakeBalance;
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.unstake.rest + ' ' + remainingStakeBalance.toString() + ' ' + config.messages.unstake.rest2 + ' ' + config.staking.minStake + ' ' + config.messages.unstake.rest3,false,false,false,false);
            }

            // Subtract from stake balance
            var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
            var subtractStakeBalance = await user.user_substract_stake_balance(unstakeAmount.toString(), userID, currentDatetime);
            if(!subtractStakeBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Add to normal balance
            var addBalance = await user.user_add_balance(unstakeAmount.toString(), userID);
            if(!addBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Log the unstake
            log.log_write_database(userID, config.messages.log.unstake, unstakeAmount.toString());
            log.log_write_database(userID, config.messages.log.unstakeadd, unstakeAmount.toString());

            // Build reply
            var replyFields = [];
            replyFields.push([config.messages.unstake.amount, unstakeAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.unstake.title,replyFields,config.messages.unstake.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_unstake: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};