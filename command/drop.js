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
var storage = require("../functions/storage.js");
var transaction = require("../functions/transaction.js");
var user = require("../functions/user.js");

module.exports = {
    command_drop: async function(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,commandFive){
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
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.private,false,false,false,false);
                return;
            }

            // Validate drop type
            if(!commandTwo || (commandTwo !== 'phrase' && commandTwo !== 'react')){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate amount parameter
            if(!commandThree || !check.check_isNumeric(commandThree) || Big(commandThree).lte(0)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Validate time parameter
            if(!commandFour || !check.check_isNumeric(commandFour) || parseInt(commandFour) <= 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var dropAmount = Big(commandThree);
            var dropTime = parseInt(commandFour);

            // Check if amount is out of safe integer range
            if(check.check_out_of_int_range(dropAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            // Check minimum drop amount
            if(dropAmount.lt(config.bot.minDropValue)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.min + ' ' + config.bot.minDropValue + ' ' + config.wallet.coinSymbolShort,false,false,false,false);
                return;
            }

            // Check drop time limits
            if(dropTime < config.bot.dropMinSeconds){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.minTime + ' ' + config.bot.dropMinSeconds,false,false,false,false);
                return;
            }

            if(dropTime > config.bot.dropMaxSeconds){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.maxTime + ' ' + config.bot.dropMaxSeconds,false,false,false,false);
                return;
            }

            // Get user balance
            var userBalance = await user.user_get_balance(userID);
            if(userBalance === false){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            // Check if user has enough balance
            if(Big(userBalance).lt(dropAmount)){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.drop.big + ' ' + dropAmount.toString() + ' ' + config.messages.drop.big1 + ' ' + userBalance + ' ' + config.messages.drop.big2,false,false,false,false);
                return;
            }

            // Subtract balance from user immediately
            var subtractBalance = await user.user_substract_balance(dropAmount.toString(), userID);
            if(!subtractBalance){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var dropId = userID + '_' + Date.now();
            var replyFields = [];
            var dropMessage = '';
            var dropIcon = '';

            if(commandTwo === 'phrase'){
                // Phrase drop
                if(!commandFive || commandFive.length < 3){
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    return;
                }

                dropMessage = commandFive;
                replyFields.push([config.messages.drop.phrase, dropMessage, false]);
                replyFields.push([config.messages.drop.amount, dropAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);
                replyFields.push([config.messages.drop.seconds, dropTime.toString(), true]);

                // Store drop data
                storage.storage_write_local_storage(dropId, 'type', 'phrase');
                storage.storage_write_local_storage(dropId, 'phrase', dropMessage);
                storage.storage_write_local_storage(dropId, 'amount', dropAmount.toString());
                storage.storage_write_local_storage(dropId, 'creator', userID);
                storage.storage_write_local_storage(dropId, 'participants', []);
                storage.storage_write_local_storage(dropId, 'channel', messageFull.channel.id);

                chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropPhraseReply,false,false,false,false);

            } else if(commandTwo === 'react'){
                // React drop
                dropIcon = config.bot.dropReactIcon;
                replyFields.push([config.messages.drop.icon, dropIcon, false]);
                replyFields.push([config.messages.drop.amount, dropAmount.toString() + ' ' + config.wallet.coinSymbolShort, true]);
                replyFields.push([config.messages.drop.seconds, dropTime.toString(), true]);

                // Store drop data
                storage.storage_write_local_storage(dropId, 'type', 'react');
                storage.storage_write_local_storage(dropId, 'icon', dropIcon);
                storage.storage_write_local_storage(dropId, 'amount', dropAmount.toString());
                storage.storage_write_local_storage(dropId, 'creator', userID);
                storage.storage_write_local_storage(dropId, 'participants', []);
                storage.storage_write_local_storage(dropId, 'channel', messageFull.channel.id);

                var dropMsg = await chat.chat_reply(messageFull,'embed',false,messageType,config.colors.special,false,config.messages.drop.title,replyFields,config.messages.drop.dropReactReply,false,false,false,false);
                
                // Add reaction to the message
                if(dropMsg){
                    try {
                        // Add the drop reaction icon as example
                        await dropMsg.react(config.bot.dropReactIcon);
                        // Set up reaction collector on the actual drop message
                        this.setupReactionCollector(dropMsg, dropId, dropIcon, dropTime);
                    } catch (error) {
                        console.log('Failed to add reaction to drop message:', error);
                        // Still set up collector even if reaction fails
                        this.setupReactionCollector(dropMsg, dropId, dropIcon, dropTime);
                    }
                }
            }

            // Set timer to end drop
            setTimeout(async () => {
                await this.endDrop(dropId);
            }, dropTime * 1000);

            // Set up message/reaction collectors
            if(commandTwo === 'phrase'){
                this.setupPhraseCollector(messageFull, dropId, dropMessage, dropTime);
            }
            
        } catch (error) {
            console.error('command_drop: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    },

    setupPhraseCollector: function(messageFull, dropId, dropPhrase, dropTime){
        const filter = m => m.content.toLowerCase() === dropPhrase.toLowerCase() && !m.author.bot;
        const collector = messageFull.channel.createMessageCollector({ filter, time: dropTime * 1000 });

        collector.on('collect', async (m) => {
            var participants = storage.storage_read_local_storage(dropId, 'participants') || [];
            var userId = m.author.id;

            // Check if user already participated
            if(participants.includes(userId)) return;

            // Check if user is registered
            var userRegistered = await user.user_registered_check(userId);
            if(!userRegistered) return;

            participants.push(userId);
            storage.storage_write_local_storage(dropId, 'participants', participants);
        });
    },

    setupReactionCollector: function(dropMessage, dropId, dropIcon, dropTime){
        const filter = (reaction, user) => {
            return reaction.emoji.name === dropIcon && !user.bot;
        };
        
        const collector = dropMessage.createReactionCollector({ filter, time: dropTime * 1000 });

        collector.on('collect', async (reaction, user) => {
            var participants = storage.storage_read_local_storage(dropId, 'participants') || [];
            var userId = user.id;

            // Check if user already participated
            if(participants.includes(userId)) return;

            // Check if user is registered
            var userRegistered = await require("../functions/user.js").user_registered_check(userId);
            if(!userRegistered) return;

            participants.push(userId);
            storage.storage_write_local_storage(dropId, 'participants', participants);
            
            if(config.staking.debug){
                console.log(`User ${userId} participated in drop ${dropId}. Total participants: ${participants.length}`);
            }
        });

        collector.on('end', () => {
            if(config.staking.debug){
                console.log(`Reaction collector ended for drop ${dropId}`);
            }
        });
    },

    endDrop: async function(dropId){
        try {
            var dropData = {
                type: storage.storage_read_local_storage(dropId, 'type'),
                amount: storage.storage_read_local_storage(dropId, 'amount'),
                creator: storage.storage_read_local_storage(dropId, 'creator'),
                participants: storage.storage_read_local_storage(dropId, 'participants') || [],
                channel: storage.storage_read_local_storage(dropId, 'channel')
            };

            if(!dropData.type || !dropData.amount || !dropData.creator) return;

            var participantCount = dropData.participants.length;

            // Check minimum participants
            if(participantCount < config.bot.dropMinUsers){
                // Refund the creator
                await user.user_add_balance(dropData.amount, dropData.creator);
                
                // Send failure message
                var channel = globalClient.channels.cache.get(dropData.channel);
                if(channel){
                    var replyFields = [];
                    replyFields.push([config.messages.drop.minFailedUser, participantCount.toString(), true]);
                    replyFields.push(['Required', config.bot.dropMinUsers.toString(), true]);
                    
                    chat.chat_reply({channel: channel},'embed',false,'guild',config.colors.warning,false,config.messages.drop.minFailedUserTitle,replyFields,config.messages.drop.minFailedUser1,false,false,false,false);
                }

                // Clean up storage
                this.cleanupDrop(dropId);
                return;
            }

            // Calculate amount per participant
            var amountPerUser = Big(dropData.amount).div(participantCount);

            // Distribute to participants
            for(var i = 0; i < dropData.participants.length; i++){
                var participantId = dropData.participants[i];
                await user.user_add_balance(amountPerUser.toString(), participantId);
                await transaction.transaction_save_payment_to_db(amountPerUser.toString(), dropData.creator, participantId, config.messages.payment.drop.received);
            }

            // Log the drop
            log.log_write_database(dropData.creator, config.messages.log.drop + ' ' + participantCount + ' ' + config.messages.log.drop1, dropData.amount);

            // Send success message
            var channel = globalClient.channels.cache.get(dropData.channel);
            if(channel){
                var replyFields = [];
                replyFields.push([config.messages.drop.amount, dropData.amount + ' ' + config.wallet.coinSymbolShort, true]);
                replyFields.push([config.messages.drop.users, participantCount.toString(), true]);
                replyFields.push([config.messages.drop.each, amountPerUser.toFixed(8) + ' ' + config.wallet.coinSymbolShort, true]);
                
                chat.chat_reply({channel: channel},'embed',false,'guild',config.colors.success,false,config.messages.drop.titleSent,replyFields,config.messages.drop.description,false,false,false,false);
            }

            // Clean up storage
            this.cleanupDrop(dropId);
            
        } catch (error) {
            console.error('endDrop: Error', error);
        }
    },

    cleanupDrop: function(dropId){
        storage.storage_delete_local_storage(dropId, 'type');
        storage.storage_delete_local_storage(dropId, 'phrase');
        storage.storage_delete_local_storage(dropId, 'icon');
        storage.storage_delete_local_storage(dropId, 'amount');
        storage.storage_delete_local_storage(dropId, 'creator');
        storage.storage_delete_local_storage(dropId, 'participants');
        storage.storage_delete_local_storage(dropId, 'channel');
    }
};