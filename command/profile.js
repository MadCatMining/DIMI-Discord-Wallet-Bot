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
var user = require("../functions/user.js");

module.exports = {
    command_profile: async function(messageFull,userID,userName,messageType,userRole){
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

            // Get user info
            var userInfo = await user.user_get_info(userID);
            if(!userInfo || userInfo.length === 0){
                chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }

            var replyFields = [];
            replyFields.push([config.messages.profile.userid,userInfo[0].discord_id.toString(),true]);
            replyFields.push([config.messages.profile.username,userInfo[0].username.toString(),true]);
            replyFields.push([config.messages.profile.registered,moment(userInfo[0].register_datetime).format('YYYY-MM-DD HH:mm:ss'),true]);

            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.profile.title,replyFields,config.messages.profile.description,false,false,false,false);
            
        } catch (error) {
            console.error('command_profile: Error', error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        }
    }
};