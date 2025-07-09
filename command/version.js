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
            if(walletInfo.connections !== undefined){
                replyFields.push([config.messages.version.walletconnections, walletInfo.connections.toString(), true]);
            }
            if(walletInfo.blocks){
                replyFields.push([config.messages.version.walletblocks, walletInfo.blocks.toString(), true]);
            }
            if(walletInfo.difficulty){
                replyFields.push([config.messages.version.walletdifficulty, walletInfo.difficulty.toString(), true]);
            }

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.version.title,replyFields,'',false,false,false,false);
            
        } catch (error) {
            console.error('command_version: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};