//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

const moment = require('moment-timezone');
var chat = require("../functions/chat.js");
var transaction = require("../functions/transaction.js");
var user = require("../functions/user.js");

module.exports = {
    command_history: async function(messageFull,userID,userName,messageType,userRole,commandTwo){
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

            // Validate history type
            if(!commandTwo || (commandTwo !== 'deposits' && commandTwo !== 'd' && commandTwo !== 'withdrawals' && commandTwo !== 'w' && commandTwo !== 'payments' && commandTwo !== 'p')){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Map short commands to full commands
            var historyType = commandTwo;
            if(commandTwo === 'd') historyType = 'deposits';
            if(commandTwo === 'w') historyType = 'withdrawals';
            if(commandTwo === 'p') historyType = 'payments';

            if(historyType === 'deposits'){
                await this.showDepositHistory(messageFull, userID, messageType);
            } else if(historyType === 'withdrawals'){
                await this.showWithdrawalHistory(messageFull, userID, messageType);
            } else if(historyType === 'payments'){
                await this.showPaymentHistory(messageFull, userID, messageType);
            }
            
        } catch (error) {
            console.error('command_history: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    showDepositHistory: async function(messageFull, userID, messageType){
        try {
            // Get user deposit address
            var userDepositAddress = await user.user_get_address(userID);
            if(!userDepositAddress){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            // Get deposit history
            var deposits = await transaction.transaction_get_deposits_by_address(config.wallet.depositsHistory, userDepositAddress);
            if(!deposits || deposits.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.deposits.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for(var i = 0; i < deposits.length; i++){
                var deposit = deposits[i];
                var status = deposit.credited ? config.messages.history.deposits.credited : config.messages.history.deposits.pending;
                var confirmations = deposit.confirmations.toString();
                var amount = deposit.amount.toString() + ' ' + config.wallet.coinSymbolShort;
                var date = moment(deposit.datetime).format('YYYY-MM-DD HH:mm:ss');
                
                replyFields.push([date, config.messages.history.deposits.amount + ': ' + amount, false]);
                replyFields.push([config.messages.history.deposits.status, status, true]);
                replyFields.push([config.messages.history.deposits.confirmations, confirmations, true]);
                replyFields.push([config.messages.history.deposits.view, config.wallet.explorerLinkTransaction + deposit.txid, false]);
                replyFields.push([0, 0, false]); // Empty line
            }

            var description = config.messages.history.deposits.description + ' ' + config.wallet.minConfirmationsCredit + ' ' + config.messages.history.deposits.description1 + ' ' + config.wallet.depositsConfirmationTime + ' ' + config.messages.history.deposits.description2;

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.deposits.title,replyFields,description,false,false,false,false);
            
        } catch (error) {
            console.error('showDepositHistory: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    showWithdrawalHistory: async function(messageFull, userID, messageType){
        try {
            // Get withdrawal history
            var withdrawals = await transaction.transaction_get_withdrawals_by_user_id(config.wallet.withdrawalsHistoryDisplayCount, userID);
            if(!withdrawals || withdrawals.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.withdrawals.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for(var i = 0; i < withdrawals.length; i++){
                var withdrawal = withdrawals[i];
                var amount = withdrawal.amount.toString() + ' ' + config.wallet.coinSymbolShort;
                var date = moment(withdrawal.datetime).format('YYYY-MM-DD HH:mm:ss');
                
                replyFields.push([date, amount, false]);
                replyFields.push(['Address', withdrawal.address, false]);
                replyFields.push(['Transaction', config.wallet.explorerLinkTransaction + withdrawal.txid, false]);
                replyFields.push([0, 0, false]); // Empty line
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.withdrawals.title,replyFields,config.messages.history.withdrawals.description,false,false,false,false);
            
        } catch (error) {
            console.error('showWithdrawalHistory: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    showPaymentHistory: async function(messageFull, userID, messageType){
        try {
            // Get payment history
            var payments = await transaction.transaction_get_payments_by_user_id(config.wallet.paymentHistoryCoun, userID);
            if(!payments || payments.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.history.payments.no,false,false,false,false);
                return;
            }

            var replyFields = [];
            for(var i = 0; i < payments.length; i++){
                var payment = payments[i];
                var amount = payment.amount.toString() + ' ' + config.wallet.coinSymbolShort;
                var date = moment(payment.datetime).format('YYYY-MM-DD HH:mm:ss');
                var type = payment.type;
                
                replyFields.push([date, config.messages.history.payments.amount + ': ' + amount, false]);
                replyFields.push([config.messages.history.payments.type, type, true]);
                replyFields.push([0, 0, false]); // Empty line
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.history.payments.title,replyFields,config.messages.history.payments.description,false,false,false,false);
            
        } catch (error) {
            console.error('showPaymentHistory: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};