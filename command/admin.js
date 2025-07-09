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
var log = require("../functions/log.js");
var transaction = require("../functions/transaction.js");
var user = require("../functions/user.js");
var wallet = require("../functions/wallet.js");

module.exports = {
    /* ------------------------------------------------------------------------------ */
    // Get deposits from wallet
    /* ------------------------------------------------------------------------------ */
    command_get_deposits: async function(messageFull,userID,userName,messageType,userRole){
        // Check if user has admin privileges
        if(userRole < 3){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        try {
            var deposits = await wallet.wallet_get_latest_deposits();
            if(!deposits){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            var depositCount = 0;
            for(var i = 0; i < deposits.length; i++){
                // Debug logging
                if(deposits[i].category === 'receive'){
                    console.log(`Debug: Processing deposit ${deposits[i].txid} with ${deposits[i].confirmations} confirmations`);
                }
                
                if(deposits[i].category === 'receive' && deposits[i].confirmations < config.wallet.minConfirmationsDeposit){
                    // Check if this deposit already exists in database with max confirmations
                    var existingDeposit = await transaction.transaction_get_deposit_by_txid(deposits[i].txid);
                    console.log(`Debug: Existing deposit check for ${deposits[i].txid}:`, existingDeposit);
                    
                    if(existingDeposit && existingDeposit.confirmations >= config.wallet.minConfirmationsDeposit){
                        console.log(`Debug: Skipping deposit ${deposits[i].txid} - already at max confirmations (${existingDeposit.confirmations})`);
                        continue; // Skip this deposit as it's already at max confirmations
                    }
                    
                    console.log(`Debug: Processing deposit ${deposits[i].txid} - wallet: ${deposits[i].confirmations}, db: ${existingDeposit ? existingDeposit.confirmations : 'new'}`);
                    var addDeposit = await transaction.transaction_add_update_deposits_on_db(deposits[i].address,deposits[i].amount,deposits[i].confirmations,deposits[i].txid);
                    if(addDeposit){
                        depositCount++;
                    }
                }
            }

            var replyMessage = messageFull ? config.messages.getdeposits.manually : config.messages.getdeposits.cron;
            var replyMessage2 = messageFull ? config.messages.getdeposits.deposits : config.messages.getdeposits.cron2;
            
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' ' + depositCount + ' ' + replyMessage2,false,false,false,false);
            } else {
                console.log(replyMessage + ' ' + depositCount + ' ' + replyMessage2);
            }
            
        } catch (error) {
            console.error('command_get_deposits: Error', error);
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Credit confirmed deposits
    /* ------------------------------------------------------------------------------ */
    command_credit_deposits: async function(messageFull,userID,userName,messageType,userRole){
        // Check if user has admin privileges (only for manual calls)
        if(messageFull && userRole < 3){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        try {
            var confirmedDeposits = await transaction.transaction_get_confirmed_deposits();
            if(!confirmedDeposits){
                if(messageFull){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                }
                return;
            }

            var creditCount = 0;
            for(var i = 0; i < confirmedDeposits.length; i++){
                var creditUserID = await user.user_get_id_by_address(confirmedDeposits[i].address);
                if(creditUserID && creditUserID !== 'notregisteredaddress'){
                    var creditBalance = await user.user_credit_balance(confirmedDeposits[i].address,confirmedDeposits[i].amount);
                    if(creditBalance){
                        var setConfirmed = await transaction.transaction_set_deposit_confirmed(confirmedDeposits[i].id);
                        if(setConfirmed){
                            log.log_write_database(creditUserID,config.messages.log.transctioncredited,confirmedDeposits[i].amount);
                            creditCount++;
                        }
                    }
                } else {
                    // Credit to unknown address
                    var setConfirmed = await transaction.transaction_set_deposit_confirmed(confirmedDeposits[i].id);
                    if(setConfirmed){
                        log.log_write_database('unknown',config.messages.log.transctioncreditedunknown,confirmedDeposits[i].amount);
                        creditCount++;
                    }
                }
            }

            var replyMessage = messageFull ? config.messages.creditdeposits.manually : config.messages.creditdeposits.cron;
            var replyMessage2 = messageFull ? config.messages.creditdeposits.deposits : config.messages.creditdeposits.cron2;
            
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' ' + creditCount + ' ' + replyMessage2,false,false,false,false);
            } else {
                console.log(replyMessage + ' ' + creditCount + ' ' + replyMessage2);
            }
            
        } catch (error) {
            console.error('command_credit_deposits: Error', error);
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear messages (admin only)
    /* ------------------------------------------------------------------------------ */
    command_clear: async function(messageFull,userID,userName,messageType,userRole){
        // Check if user has admin privileges
        if(userRole < 3){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        // Cannot clear DM messages
        if(messageType === 1){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.clear.no,false,false,false,false);
            return;
        }

        try {
            // Delete messages in bulk (Discord.js v14 method)
            const messages = await messageFull.channel.messages.fetch({ limit: 100 });
            await messageFull.channel.bulkDelete(messages);
            
        } catch (error) {
            console.error('command_clear: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};