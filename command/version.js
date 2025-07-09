//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("../functions/chat.js");
var wallet = require("../functions/wallet.js");

module.exports = {
    command_version: async function(messageFull,userID,userName,messageType,userRole){
        try {
            // Get wallet info
            var walletInfo = await wallet.wallet_get_info();
            if(walletInfo === 'error' || !walletInfo){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }

            var replyFields = [];
            replyFields.push([config.messages.version.botversion, config.bot.version.toString(), true]);
            
            // Handle different wallet info structures
            if(walletInfo.version){
                replyFields.push([config.messages.version.walletversion, walletInfo.version.toString(), true]);
            }
            if(walletInfo.protocolversion){
                replyFields.push([config.messages.version.walletprotocolversion, walletInfo.protocolversion.toString(), true]);
            }
            
            // Try to get connections from different sources
            var connections = 0;
            if(walletInfo.connections !== undefined && walletInfo.connections !== null){
                connections = walletInfo.connections;
            } else {
                // Try to get network info separately for newer wallets
                try {
                    var networkInfo = await wallet.wallet_get_network_info();
                    if(networkInfo && networkInfo.connections !== undefined){
                        connections = networkInfo.connections;
                    }
                } catch (error) {
                    console.log('Could not get network info, using 0 connections');
                }
            }
            replyFields.push([config.messages.version.walletconnections, connections.toString(), true]);
            
            if(walletInfo.blocks){
                replyFields.push([config.messages.version.walletblocks, walletInfo.blocks.toString(), true]);
            }
            if(walletInfo.difficulty !== undefined && walletInfo.difficulty !== null){
                // Handle different difficulty formats (number, string, or object)
                var difficultyValue = walletInfo.difficulty;
                if(typeof difficultyValue === 'object' && difficultyValue['proof-of-stake']){
                    // Some wallets return difficulty as an object with proof-of-stake property
                    difficultyValue = difficultyValue['proof-of-stake'];
                }
                replyFields.push([config.messages.version.walletdifficulty, difficultyValue.toString(), true]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,replyFields,'',false,false,false,false);
            
        } catch (error) {
            console.error('command_version: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};