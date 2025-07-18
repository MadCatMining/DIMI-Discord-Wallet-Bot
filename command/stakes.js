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
    // Get stakes from wallet transactions
    /* ------------------------------------------------------------------------------ */
    command_get_stakes: async function(messageFull,userID,userName,messageType,userRole){
        // Check if user has admin privileges
        if(userRole < 3){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        try {
            var stakeTransactions = await transaction.transaction_get_stake_transactions();
            if(!stakeTransactions){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var checkedCount = 0;
            for(var i = 0; i < stakeTransactions.length; i++){
                var txid = stakeTransactions[i].txid;
                
                // Get transaction details from wallet
                var tx = await wallet.wallet_get_transaction(txid);
                if(!tx){
                    // Mark as checked but not stake if we can't get transaction
                    await transaction.transaction_update_stake_transaction(txid, 0, 0, null);
                    checkedCount++;
                    continue;
                }

                // Check for orphaned/abandoned transactions
                var isOrphaned = await this.checkIfTransactionIsOrphaned(tx);
                if(isOrphaned){
                    if(config.staking.debug){
                        console.log(`Transaction ${txid} is orphaned/abandoned, marking as non-stake`);
                    }
                    await transaction.transaction_update_stake_transaction(txid, 0, 0, tx.blockhash || null);
                    checkedCount++;
                    continue;
                }

                // Calculate stake reward and check if it's a stake transaction
                var stakeResult = await wallet.wallet_calculate_stake_reward(tx);
                
                // Handle different return formats based on wallet mode
                var stakeReward = null;
                var isStake = false;
                
                if(config.staking.walletMode === 'modern'){
                    // Modern mode returns an object with reward and isStake
                    if(stakeResult && typeof stakeResult === 'object'){
                        stakeReward = stakeResult.reward;
                        isStake = stakeResult.isStake;
                    }
                } else {
                    // Legacy mode returns just the reward amount (or null)
                    stakeReward = stakeResult;
                    isStake = stakeReward && stakeReward > 0;
                }
                
                if(isStake){
                    // This is a stake transaction
                    var rewardAmount = stakeReward || 0;
                    await transaction.transaction_update_stake_transaction(txid, rewardAmount, 1, tx.blockhash || null);
                    if(config.staking.debug){
                        console.log(`Stake found: ${txid} - Reward: ${rewardAmount}`);
                    }
                } else {
                    // Not a stake transaction (could be proof-of-work or other)
                    await transaction.transaction_update_stake_transaction(txid, 0, 0, tx.blockhash || null);
                    if(config.staking.debug){
                        console.log(`Non-stake transaction: ${txid}`);
                    }
                }
                
                checkedCount++;
            }

            var replyMessage = messageFull ? config.messages.getstakes.manually : config.messages.getstakes.cron;
            var replyMessage2 = messageFull ? config.messages.getstakes.transactions : config.messages.getstakes.cron2;
            
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' ' + checkedCount + ' ' + replyMessage2,false,false,false,false);
            } else {
                console.log(replyMessage + ' ' + checkedCount + ' ' + replyMessage2);
            }
            
        } catch (error) {
            console.error('command_get_stakes: Error', error);
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Check if transaction is orphaned/abandoned
    /* ------------------------------------------------------------------------------ */
    checkIfTransactionIsOrphaned: async function(tx){
        try {
            // Check for obvious signs of orphaned transaction
            if(tx.confirmations === 0){
                if(config.staking.debug){
                    console.log(`Transaction ${tx.txid} has 0 confirmations`);
                }
                return true;
            }

            // Check for wallet conflicts (indicates orphaned block)
            if(tx.walletconflicts && tx.walletconflicts.length > 0){
                if(config.staking.debug){
                    console.log(`Transaction ${tx.txid} has wallet conflicts: ${tx.walletconflicts.join(', ')}`);
                }
                return true;
            }

            // Check if any details are marked as abandoned
            if(tx.details && Array.isArray(tx.details)){
                for(var i = 0; i < tx.details.length; i++){
                    if(tx.details[i].abandoned === true){
                        if(config.staking.debug){
                            console.log(`Transaction ${tx.txid} has abandoned details`);
                        }
                        return true;
                    }
                }
            }

            // Check if trusted is false (indicates potential orphan)
            if(tx.trusted === false){
                if(config.staking.debug){
                    console.log(`Transaction ${tx.txid} is not trusted`);
                }
                return true;
            }

            return false;
            
        } catch (error) {
            console.error('checkIfTransactionIsOrphaned: Error', error);
            // If we can't determine, assume it's orphaned to be safe
            return true;
        }
    },
    /* ------------------------------------------------------------------------------ */
    // Credit stakes to users
    /* ------------------------------------------------------------------------------ */
    command_credit_stakes: async function(messageFull,userID,userName,messageType,userRole){
        // Check if user has admin privileges (only for manual calls)
        if(messageFull && userRole < 3){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        try {
            var stakesToCredit = await transaction.transaction_get_stake_transactions_to_credit();
            if(!stakesToCredit || stakesToCredit.length === 0){
                var replyMessage = messageFull ? config.messages.creditstakes.manually : config.messages.creditstakes.cron;
                var replyMessage2 = messageFull ? config.messages.creditstakes.transactions : config.messages.creditstakes.cron2;
                
                if(messageFull){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' 0 ' + replyMessage2,false,false,false,false);
                } else {
                    console.log(replyMessage + ' 0 ' + replyMessage2);
                }
                return;
            }

            // Get wallet balance for calculations
            var walletBalance = await wallet.wallet_get_balance();
            if(!walletBalance){
                if(messageFull){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                }
                return;
            }

            // Get all users with stake balance
            var stakeUsers = await user.user_get_stake_users();
            if(!stakeUsers || stakeUsers.length === 0){
                // Mark transactions as credited even if no users to credit
                var highestTransactionID = Math.max(...stakesToCredit.map(s => s.id));
                await transaction.transaction_update_stake_transaction_credited(highestTransactionID);
                
                var replyMessage = messageFull ? config.messages.creditstakes.manually : config.messages.creditstakes.cron;
                var replyMessage2 = messageFull ? config.messages.creditstakes.transactions : config.messages.creditstakes.cron2;
                
                if(messageFull){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' 0 ' + replyMessage2,false,false,false,false);
                } else {
                    console.log(replyMessage + ' 0 ' + replyMessage2);
                }
                return;
            }

            // Calculate total stake amount from transactions
            var totalStakeAmount = Big(0);
            for(var i = 0; i < stakesToCredit.length; i++){
                totalStakeAmount = totalStakeAmount.plus(stakesToCredit[i].amount);
            }

            // Calculate total stake balance of all users
            var totalUserStakeBalance = Big(0);
            for(var i = 0; i < stakeUsers.length; i++){
                totalUserStakeBalance = totalUserStakeBalance.plus(stakeUsers[i].stake_balance);
            }

            // Calculate amount for stakers (minus owner percentage)
            var ownerPercentage = Big(config.staking.ownerPercentage).div(100);
            var totalStakeForStakers = totalStakeAmount.times(Big(1).minus(ownerPercentage));

            if(config.staking.debug){
                console.log(config.messages.log.stakecredit + ' ' + walletBalance);
                console.log(config.messages.log.stakecredit1 + ' ' + totalStakeAmount.toString());
                console.log(config.messages.log.stakecredit2 + ' ' + totalStakeForStakers.toString());
                console.log(config.messages.log.stakecredit3 + ' ' + stakeUsers.length);
                console.log(config.messages.log.stakecredit5 + ' ' + totalUserStakeBalance.toString());
                console.log(config.messages.log.stakecredit6 + ' ' + totalStakeForStakers.toString());
                console.log(config.messages.log.stakecredit7 + ' ' + stakesToCredit.map(s => s.id).join(', '));
            }

            // Credit each user proportionally
            var creditedUsers = 0;
            for(var i = 0; i < stakeUsers.length; i++){
                var stakeUser = stakeUsers[i];
                var userStakeBalance = Big(stakeUser.stake_balance);
                
                // Calculate user's share of total stakes
                var userShare = userStakeBalance.div(totalUserStakeBalance);
                var userCreditAmount = totalStakeForStakers.times(userShare);

                if(userCreditAmount.gt(0)){
                    // Add to user's normal balance
                    var addBalance = await user.user_add_balance(userCreditAmount.toString(), stakeUser.discord_id);
                    if(addBalance){
                        // Save payment record
                        await transaction.transaction_save_payment_to_db(userCreditAmount.toString(), config.bot.botID, stakeUser.discord_id, config.messages.payment.stake.received);
                        
                        // Log the credit
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit8 + ' ' + stakeUser.discord_id, userCreditAmount.toString());
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit9 + ' ' + userStakeBalance.toString(), 0);
                        log.log_write_database(stakeUser.discord_id, config.messages.log.stakecredit10 + ' ' + userCreditAmount.toString(), 0);
                        
                        creditedUsers++;
                    }
                }
            }

            // Mark transactions as credited
            var highestTransactionID = Math.max(...stakesToCredit.map(s => s.id));
            await transaction.transaction_update_stake_transaction_credited(highestTransactionID);

            // Send pool notification if configured
            if(config.bot.stakePoolChannelID && totalStakeForStakers.gt(0) && creditedUsers > 0){
                if(config.staking.debug){
                    console.log('Preparing to send staking pool notification...');
                    console.log('Channel ID:', config.bot.stakePoolChannelID);
                    console.log('Total stake for stakers:', totalStakeForStakers.toString());
                    console.log('Credited users:', creditedUsers);
                }

                var replyFields = [];
                replyFields.push([config.messages.creditstakes.stakes, stakesToCredit.length.toString(), true]);
                replyFields.push([config.messages.creditstakes.amount, totalStakeForStakers.toString() + ' ' + config.wallet.coinSymbolShort, true]);
                replyFields.push([config.messages.creditstakes.users, creditedUsers.toString(), true]);

                try {
                    // Get the channel directly and send the message
                    var poolChannel = globalClient.channels.cache.get(config.bot.stakePoolChannelID);
                    if(!poolChannel){
                        console.error('Pool channel not found. Channel ID:', config.bot.stakePoolChannelID);
                        console.log('Available channels:', Array.from(globalClient.channels.cache.keys()));
                        return;
                    }

                    if(config.staking.debug){
                        console.log('Found pool channel:', poolChannel.name);
                        console.log('Channel type:', poolChannel.type);
                    }

                    // Build the embed message
                    var embed = chat.chat_build_reply('embed', false, 'guild', config.colors.success, false, config.messages.creditstakes.title, replyFields, config.messages.creditstakes.description, false, false, false, false);
                    
                    // Send the message
                    await poolChannel.send({embeds: [embed]});
                    
                    if(config.staking.debug){
                        console.log('Staking pool notification sent successfully');
                    }
                } catch (error) {
                    console.error('Failed to send staking pool notification:');
                    console.error('Error:', error.message);
                    console.error('Stack:', error.stack);
                }
            }

            var replyMessage = messageFull ? config.messages.creditstakes.manually : config.messages.creditstakes.cron;
            var replyMessage2 = messageFull ? config.messages.creditstakes.transactions : config.messages.creditstakes.cron2;
            
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,false,false,replyMessage + ' ' + stakesToCredit.length + ' ' + replyMessage2,false,false,false,false);
            } else {
                console.log(replyMessage + ' ' + stakesToCredit.length + ' ' + replyMessage2);
            }
            
        } catch (error) {
            console.error('command_credit_stakes: Error', error);
            if(messageFull){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            }
        }
    }
};
