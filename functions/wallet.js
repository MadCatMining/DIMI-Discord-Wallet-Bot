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

// Bitcoin RPC client using bitcoin-core package
const Client = require('bitcoin-core');

// Initialize RPC client
const coinClient = new Client({
    host: config.wallet.server,
    port: config.wallet.port,
    username: config.wallet.user, 
    password: config.wallet.password,
    timeout: 30000,
    network: 'mainnet'
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
            coinClient.getNewAddress().then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_create_deposit_address: Wallet query problem. (getnewaddress)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get latest deposits from wallet
    /* ------------------------------------------------------------------------------ */

    wallet_get_latest_deposits: function(){
        return new Promise((resolve, reject)=>{
            coinClient.listTransactions('*', config.wallet.depositsToCheck).then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_latest_deposits: Wallet query problem. (listtransactions)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Check if payout address is valid
    /* ------------------------------------------------------------------------------ */

    wallet_validate_address: function(address){
        return new Promise((resolve, reject)=>{
            coinClient.validateAddress(address).then(result => {
                resolve(result.isvalid);
            }).catch(error => {
                var errorMessage = "wallet_validate_address: Wallet query problem. (validateaddress)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve('error');
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Do withdrawal to address
    /* ------------------------------------------------------------------------------ */

    wallet_send_to_address: function(address,amount){
        return new Promise((resolve, reject)=>{
            coinClient.sendToAddress(address, amount).then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_send_to_address: Wallet query problem. (sendtoaddress)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get transaction
    /* ------------------------------------------------------------------------------ */

    wallet_get_transaction: function(txid){
        return new Promise((resolve, reject)=>{
            coinClient.getTransaction(txid).then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_transaction: Wallet query problem. (gettransaction)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get block
    /* ------------------------------------------------------------------------------ */

    wallet_get_block: function(blockhash){
        return new Promise((resolve, reject)=>{
            coinClient.getBlock(blockhash).then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_block: Wallet query problem. (getblock)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get balance
    /* ------------------------------------------------------------------------------ */

    wallet_get_balance: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getBalance('*').then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_balance: Wallet query problem. (getbalance)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get wallet info - Updated for newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_info: function(){
        return new Promise((resolve, reject)=>{
            // Try getwalletinfo first (newer wallets), fallback to getinfo (older wallets)
            coinClient.getWalletInfo().then(result => {
                // For newer wallets, we might need additional info from getblockchaininfo
                coinClient.getBlockchainInfo().then(blockchainInfo => {
                    // Merge wallet info with blockchain info for compatibility
                    const combinedInfo = {
                        ...result,
                        blocks: blockchainInfo.blocks,
                        difficulty: blockchainInfo.difficulty,
                        connections: blockchainInfo.connections || 0
                    };
                    resolve(combinedInfo);
                }).catch(error3 => {
                    // If getblockchaininfo fails, just return wallet info
                    resolve(result);
                });
            }).catch(error => {
                // Fallback to getinfo for older wallets
                coinClient.command('getinfo').then(result2 => {
                    resolve(result2);
                }).catch(error2 => {
                    var errorMessage = "wallet_create_deposit_address: Wallet query problem. (getnewaddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error2);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error2);
                    resolve('error');
                });
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get network info - For newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_network_info: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getNetworkInfo().then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_network_info: Wallet query problem. (getnetworkinfo)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve('error');
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get blockchain info - For newer wallet versions
    /* ------------------------------------------------------------------------------ */

    wallet_get_blockchain_info: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getBlockchainInfo().then(result => {
                resolve(result);
            }).catch(error => {
                var errorMessage = "wallet_get_blockchain_info: Wallet query problem. (getblockchaininfo)";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve('error');
            });
        });
    }

};