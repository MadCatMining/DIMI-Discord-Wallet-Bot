//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("../functions/chat.js");

module.exports = {
    command_donate: async function(messageFull,userID,userName,messageType,userRole){
        try {
            var replyFields = [];
            replyFields.push([config.messages.donate.address, config.wallet.donateAddress, false]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.donate.title,replyFields,config.messages.donate.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_donate: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};