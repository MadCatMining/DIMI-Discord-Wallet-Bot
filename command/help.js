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
    command_help: function(messageFull,userID,userName,messageType,userRole){
        var replyFields = [];
        
        // Normal user commands
        if(config.commands.register)
            replyFields.push([config.messages.help.registerTitle,config.messages.help.registerValue,false]);
        if(config.commands.profile)
            replyFields.push([config.messages.help.profileTitle,config.messages.help.profileValue,false]);
        if(config.commands.balance)
            replyFields.push([config.messages.help.balanceTitle,config.messages.help.balanceValue,false]);
        if(config.commands.deposit)
            replyFields.push([config.messages.help.depositTitle,config.messages.help.depositValue,false]);
        if(config.commands.withdraw)
            replyFields.push([config.messages.help.withdrawTitle,config.messages.help.withdrawValue,false]);
        if(config.commands.stake)
            replyFields.push([config.messages.help.stakeTitle,config.messages.help.stakeValue,false]);
        if(config.commands.unstake)
            replyFields.push([config.messages.help.unstakeTitle,config.messages.help.unstakeValue,false]);
        if(config.commands.tip)
            replyFields.push([config.messages.help.tipTitle,config.messages.help.tipValue,false]);
        if(config.commands.rain)
            replyFields.push([config.messages.help.rainTitle,config.messages.help.rainValue,false]);
        if(config.commands.drop)
            replyFields.push([config.messages.help.dropTitle,config.messages.help.dropValue,false]);
        if(config.commands.history)
            replyFields.push([config.messages.help.historyTitle,config.messages.help.historyValue,false]);
        if(config.commands.update)
            replyFields.push([config.messages.help.updateTitle,config.messages.help.updateValue,false]);
        if(config.commands.donate)
            replyFields.push([config.messages.help.donateTitle,config.messages.help.donateValue,false]);
        if(config.commands.notify)
            replyFields.push([config.messages.help.notifyTitle,config.messages.help.notifyValue,false]);
        if(config.commands.version)
            replyFields.push([config.messages.help.versionTitle,config.messages.help.versionValue,false]);

        // Admin commands
        if(userRole >= 3){
            replyFields.push([0,0,false]); // Empty line
            replyFields.push([config.messages.help.admin.title,'',false]);
            if(config.commands.startstop)
                replyFields.push([config.messages.help.admin.startStopTitle,config.messages.help.admin.startStopValue,false]);
            if(config.commands.getdeposits)
                replyFields.push([config.messages.help.admin.getDepositsTitle,config.messages.help.admin.getDepositsValue,false]);
            if(config.commands.creditdeposits)
                replyFields.push([config.messages.help.admin.creditDepositsTitle,config.messages.help.admin.creditDepositsValue,false]);
            if(config.commands.getstakes)
                replyFields.push([config.messages.help.admin.getStakesTitle,config.messages.help.admin.getStakesValue,false]);
            if(config.commands.creditstakes)
                replyFields.push([config.messages.help.admin.creditStakesTitle,config.messages.help.admin.creditStakesValue,false]);
            if(config.commands.clear)
                replyFields.push([config.messages.help.admin.clearTitle,config.messages.help.admin.clearValue,false]);
        }

        chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.normal,false,config.messages.help.title,replyFields,'',false,false,false,false);
    }
};