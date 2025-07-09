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
var wallet = require("../functions/wallet.js");

module.exports = {
    command_withdraw: async function(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree){
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

            // Validate address parameter
            if(!commandTwo){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount parameter
            if(!commandThree || !check.check_isNumeric(commandThree) || Big(commandThree).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var withdrawAmount = Big(commandThree);
            var withdrawAddress = commandTwo;

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(withdrawAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum withdrawal amount
            if(withdrawAmount.lt(config.wallet.minWithdrawalValue)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.min + ' ' + config.wallet.minWithdrawalValue + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Validate withdrawal address
            var addressValid = await wallet.wallet_validate_address(withdrawAddress);
            if(addressValid === 'error'){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }
            
            if(!addressValid){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.notvalid,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Calculate total amount needed (amount + fee)
            var totalNeeded = withdrawAmount.plus(config.wallet.transactionFee);
            var maxWithdrawable = Big(userBalance).minus(config.wallet.transactionFee);

            // Check if user has enough balance
            if(Big(userBalance).lt(totalNeeded)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.withdraw.big + ' ' + withdrawAmount.toString() + ' ' + config.messages.withdraw.big1 + ' ' + config.wallet.transactionFee + ' ' + config.messages.withdraw.big2 + ' ' + totalNeeded.toString() + ' ' + config.messages.withdraw.big3 + ' ' + userBalance + ' ' + config.messages.withdraw.big4 + ' ' + maxWithdrawable.toString() + ' ' + config.messages.withdraw.big5,false,false,false,false);
                return;
            }

            // Send withdrawal
            var txid = await wallet.wallet_send_to_address(withdrawAddress, withdrawAmount.toNumber());
            if(!txid){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            // Subtract balance from user (amount + fee)
            var subtractBalance = await user.user_substract_balance(totalNeeded.toString(), userID);
            if(!subtractBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.failDBsave,false,false,false,false);
                return;
            }

            // Save withdrawal to database
            var saveWithdrawal = await transaction.transaction_save_withdrawal_to_db(userID, withdrawAddress, withdrawAmount.toString(), txid);
            if(!saveWithdrawal){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.failDBsave,false,false,false,false);
                return;
            }

            // Log withdrawal
            log.log_write_database(userID, config.messages.log.withdrawrequest + ' ' + withdrawAddress, withdrawAmount.toString());

            // Build reply
            var replyFields = [];
            replyFields.push([config.messages.withdraw.amount, withdrawAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);
            replyFields.push([config.messages.withdraw.address, withdrawAddress, false]);
            replyFields.push([config.messages.withdraw.transaction, config.wallet.explorerLinkTransaction + txid, false]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.withdraw.title,replyFields,config.messages.withdraw.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_withdraw: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};