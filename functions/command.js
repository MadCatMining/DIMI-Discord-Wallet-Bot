//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

var chat = require("./chat.js");
var check = require("./check.js");
var log = require("./log.js");
var storage = require("./storage.js");
var transaction = require("./transaction.js");
var user = require("./user.js");
var wallet = require("./wallet.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Fire command
    /* ------------------------------------------------------------------------------ */

    fire_command: function(messageFull,userID,userName,messageType,userRole,commandOne,commandTwo,commandThree,commandFour,commandFive,serverUsers,activeUsers){
        
        // Map short commands to full commands
        const commandAliases = {
            'r': 'register',
            'p': 'profile', 
            'b': 'balance',
            'd': 'deposit',
            'w': 'withdraw',
            'u': 'update',
            'v': 'version',
            'h': 'help',
            'gd': 'getdeposits',
            'cd': 'creditdeposits',
            'gs': 'getstakes',
            'cs': 'creditstakes',
            'c': 'clear'
        };

        // Convert alias to full command name
        const fullCommandName = commandAliases[commandOne] || commandOne;

        // Check if command is enabled in config
        if(!config.commands[fullCommandName]){
            console.log(`Command ${fullCommandName} is disabled in config`);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }

        // Check if user is currently blocked (processing another command)
        if(storage.storage_read_local_storage(userID,'blocked')){
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }

        // Block user during command processing
        storage.storage_write_local_storage(userID,'blocked',true);

        try {
            console.log(`Processing command: ${fullCommandName} for user: ${userID}`);
            
            // Route to appropriate command handler using full command name
            switch(fullCommandName) {
                case 'help':
                    this.command_help(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'register':
                    this.command_register(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'profile':
                    this.command_profile(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'balance':
                    this.command_balance(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'deposit':
                    this.command_deposit(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'withdraw':
                    this.command_withdraw(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'tip':
                    this.command_tip(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree);
                    break;
                case 'rain':
                    this.command_rain(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,serverUsers,activeUsers);
                    break;
                case 'drop':
                    this.command_drop(messageFull,userID,userName,messageType,userRole,commandTwo,commandThree,commandFour,commandFive);
                    break;
                case 'history':
                    this.command_history(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'update':
                    this.command_update(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'donate':
                    this.command_donate(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'stake':
                    this.command_stake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'unstake':
                    this.command_unstake(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'notify':
                    this.command_notify(messageFull,userID,userName,messageType,userRole,commandTwo);
                    break;
                case 'version':
                    this.command_version(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'getdeposits':
                    this.command_get_deposits(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'creditdeposits':
                    this.command_credit_deposits(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'getstakes':
                    this.command_get_stakes(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'creditstakes':
                    this.command_credit_stakes(messageFull,userID,userName,messageType,userRole);
                    break;
                case 'clear':
                    this.command_clear(messageFull,userID,userName,messageType,userRole);
                    break;
                default:
                    console.log(`Unknown command: ${fullCommandName}`);
                    chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                    break;
            }
        } catch (error) {
            console.error(`fire_command: Error processing command ${fullCommandName}`, error);
            chat.chat_reply(messageFull,'embed',"<@" + userID + ">",messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
        } finally {
            // Always unblock user after command processing
            storage.storage_delete_local_storage(userID,'blocked');
        }
    }
};