//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var log = require('./log.js');

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// Bitcoin RPC client for newer wallet versions
const BitcoinRPC = require('node-bitcoin-rpc');

// Initialize RPC client
const coinClient = new BitcoinRPC({
    host: config.wallet.server,
    port: config.wallet.port,
    username: config.wallet.user,
    password: config.wallet.password,
    timeout: 30000
});

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Create deposit address for user id
    /* ------------------------------------------------------------------------------ */

    wallet_create_deposit_address: function(){
        return new Promise((resolve, reject)=>{
            coinClient.call('getnewaddress', [], function(error, result) {
                if(error){
                    var errorMessage = "wallet_create_deposit_address: Wallet query problem. (getnewaddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get latest deposits from wallet
    /* ------------------------------------------------------------------------------ */

    wallet_get_latest_deposits: function(){
        return new Promise((resolve, reject)=>{
            coinClient.call('listtransactions', ['*', config.wallet.depositsToCheck], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_latest_deposits: Wallet query problem. (listtransactions)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Check if payout address is valid
    /* ------------------------------------------------------------------------------ */

    wallet_validate_address: function(address){
        return new Promise((resolve, reject)=>{
            coinClient.call('validateaddress', [address], function(error, result) {
                if(error){
                    var errorMessage = "wallet_validate_address: Wallet query problem. (validateaddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    resolve(result.isvalid);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Do withdrawal to address
    /* ------------------------------------------------------------------------------ */

    wallet_send_to_address: function(address,amount){
        return new Promise((resolve, reject)=>{
            coinClient.call('sendtoaddress', [address, amount], function(error, result) {
                if(error){
                    var errorMessage = "wallet_send_to_address: Wallet query problem. (sendtoaddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get transaction
    /* ------------------------------------------------------------------------------ */

    wallet_get_transaction: function(txid){
        return new Promise((resolve, reject)=>{
            coinClient.call('gettransaction', [txid], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_transaction: Wallet query problem. (gettransaction)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get block
    /* ------------------------------------------------------------------------------ */

    wallet_get_block: function(blockhash){
        return new Promise((resolve, reject)=>{
            coinClient.call('getblock', [blockhash], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_block: Wallet query problem. (getblock)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get balance
    /* ------------------------------------------------------------------------------ */

    wallet_get_balance: function(){
        return new Promise((resolve, reject)=>{
            coinClient.call('getbalance', ['*'], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_balance: Wallet query problem. (getbalance)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get wallet info - Updated for newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_info: function(){
        return new Promise((resolve, reject)=>{
            // Try getwalletinfo first (newer wallets), fallback to getinfo (older wallets)
            coinClient.call('getwalletinfo', [], function(error, result) {
                if(error){
                    // Fallback to getinfo for older wallets
                    coinClient.call('getinfo', [], function(error2, result2) {
                        if(error2){
                            var errorMessage = "wallet_get_info: Wallet query problem. (getwalletinfo/getinfo)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error2);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error2);
                            resolve('error');
                        }else{
                            resolve(result2);
                        }
                    });
                }else{
                    // For newer wallets, we might need additional info from getblockchaininfo
                    coinClient.call('getblockchaininfo', [], function(error3, blockchainInfo) {
                        if(error3){
                            // If getblockchaininfo fails, just return wallet info
                            resolve(result);
                        }else{
                            // Merge wallet info with blockchain info for compatibility
                            const combinedInfo = {
                                ...result,
                                blocks: blockchainInfo.blocks,
                                difficulty: blockchainInfo.difficulty,
                                connections: blockchainInfo.connections || 0
                            };
                            resolve(combinedInfo);
                        }
                    });
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get network info - For newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_network_info: function(){
        return new Promise((resolve, reject)=>{
            coinClient.call('getnetworkinfo', [], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_network_info: Wallet query problem. (getnetworkinfo)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get blockchain info - For newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_blockchain_info: function(){
        return new Promise((resolve, reject)=>{
            coinClient.call('getblockchaininfo', [], function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_blockchain_info: Wallet query problem. (getblockchaininfo)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    resolve(result);
                }   
            });
        });
    }

};