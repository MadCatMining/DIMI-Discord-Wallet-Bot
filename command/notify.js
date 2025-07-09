//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("../functions/chat.js");
var storage = require("../functions/storage.js");
var user = require("../functions/user.js");

module.exports = {
    command_notify: async function(messageFull,userID,userName,messageType,userRole,commandTwo){
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

            // Validate setting parameter
            if(!commandTwo || (commandTwo !== 'on' && commandTwo !== 'off')){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }

            var notifyEnabled = commandTwo === 'on';
            
            // Store notification preference
            storage.storage_write_local_storage(userID, 'notifications', notifyEnabled);

            var message = notifyEnabled ? config.messages.notify.enabled : config.messages.notify.disabled;
            
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.success,false,config.messages.notify.title,false,message,false,false,false,false);
            
        } catch (error) {
            console.error('command_notify: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};