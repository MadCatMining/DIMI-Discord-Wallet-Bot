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
    // Get wallet info - Updated for newer wallet versions with proper connections handling
    /* ------------------------------------------------------------------------------ */

    wallet_get_info: function(){
        return new Promise((resolve, reject)=>{
            // Try getinfo first (works for most wallets including DiminutiveCoin)
            coinClient.command('getinfo').then(result => {
                resolve(result);
            }).catch(error => {
                // Fallback to getwalletinfo + getnetworkinfo for newer wallets
                coinClient.getWalletInfo().then(walletResult => {
                    // Get network info for connections
                    coinClient.getNetworkInfo().then(networkResult => {
                        // Get blockchain info for blocks and difficulty
                        coinClient.getBlockchainInfo().then(blockchainResult => {
                            // Merge all info together
                            const combinedInfo = {
                                ...walletResult,
                                connections: networkResult.connections || 0,
                                blocks: blockchainResult.blocks,
                                difficulty: blockchainResult.difficulty
                            };
                            resolve(combinedInfo);
                        }).catch(error4 => {
                            // If blockchain info fails, merge wallet + network
                            const combinedInfo = {
                                ...walletResult,
                                connections: networkResult.connections || 0
                            };
                            resolve(combinedInfo);
                        });
                    }).catch(error3 => {
                        // If network info fails, just return wallet info
                        resolve(walletResult);
                    });
                }).catch(error2 => {
                    var errorMessage = "wallet_get_info: Wallet query problem. (getinfo/getwalletinfo)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error2);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error2);
                    resolve(false);
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
    },

    /* ------------------------------------------------------------------------------ */
    // Get raw transaction - For DiminutiveCoin wallet (uses decoderawtransaction)
    /* ------------------------------------------------------------------------------ */

    wallet_get_raw_transaction: function(txid, verbose = 1){
        return new Promise((resolve, reject)=>{
            // First get the raw hex
            coinClient.getRawTransaction(txid, 0).then(rawHex => {
                if(verbose === 0){
                    resolve(rawHex);
                } else {
                    // Decode the raw transaction
                    coinClient.decodeRawTransaction(rawHex).then(decodedTx => {
                        resolve(decodedTx);
                    }).catch(decodeError => {
                        var errorMessage = "wallet_get_raw_transaction: Wallet decode problem. (decoderawtransaction)";
                        if(config.bot.errorLogging){
                            log.log_write_file(errorMessage);
                            log.log_write_file(decodeError);
                        }
                        log.log_write_console(errorMessage);
                        log.log_write_console(decodeError);
                        resolve(false);
                    });
                }
            }).catch(error => {
                var errorMessage = "wallet_get_raw_transaction: Wallet query problem. (getrawtransaction)";
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

    wallet_get_actual_deposit_amount: async function(txid, depositAddress) {
        try {
            // Get the raw transaction details
            const rawTx = await this.wallet_get_raw_transaction(txid, 1);
            if(!rawTx || !rawTx.vout){
                if(config.staking.debug){
                    console.log(`Could not get raw transaction for ${txid}`);
                }
                return null;
            }

            // Check if this is a staking transaction (vout[0].value = 0)
            if(rawTx.vout[0] && rawTx.vout[0].value === 0){
                if(config.staking.debug){
                    console.log(`Transaction ${txid} is a staking transaction (vout[0].value = 0), skipping deposit processing`);
                }
                return null; // This is a staking transaction, not a deposit
            }

            // Find the vout that matches the deposit address
            for(let i = 0; i < rawTx.vout.length; i++){
                const vout = rawTx.vout[i];
                if(vout.scriptPubKey && vout.scriptPubKey.addresses){
                    if(vout.scriptPubKey.addresses.includes(depositAddress)){
                        if(config.staking.debug){
                            console.log(`Found deposit amount ${vout.value} for address ${depositAddress} in transaction ${txid}`);
                        }
                        return vout.value;
                    }
                }
            }

            if(config.staking.debug){
                console.log(`No matching address found in transaction ${txid}`);
            }
            return null;

        } catch(error) {
            var errorMessage = "wallet_get_actual_deposit_amount: Error getting actual deposit amount";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return null;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Calculate stake reward based on wallet mode  
    /* ------------------------------------------------------------------------------ */

    wallet_calculate_stake_reward: async function(tx){
        if(config.staking.walletMode === 'legacy'){
            return this.wallet_calculate_legacy_stake_reward(tx);
        } else if(config.staking.walletMode === 'modern'){
            return await this.wallet_calculate_modern_stake_reward(tx);
        } else {
            var errorMessage = `wallet_calculate_stake_reward: Unsupported wallet mode: ${config.staking.walletMode}`;
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
            }
            log.log_write_console(errorMessage);
            return null;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Calculate stake reward for legacy wallets (pre-v13)
    /* ------------------------------------------------------------------------------ */

    wallet_calculate_legacy_stake_reward: function(tx){
        // For legacy wallets, we use the simplified block mint approach
        return this.wallet_calculate_legacy_modern_stake_reward(tx);
    },

    /* ------------------------------------------------------------------------------ */
    // Calculate stake reward for legacy wallets using block mint value
    /* ------------------------------------------------------------------------------ */

    wallet_calculate_legacy_modern_stake_reward: async function(tx){
        try {
            if(config.staking.debug){
                console.log(`Checking legacy stake transaction: ${tx.txid}`);
            }

            // Check if transaction has a blockhash
            if(!tx.blockhash){
                if(config.staking.debug){
                    console.log(`No blockhash found for transaction ${tx.txid}`);
                }
                return null;
            }

            // Get the block details
            const blockDetails = await this.wallet_get_block(tx.blockhash);
            if(!blockDetails){
                if(config.staking.debug){
                    console.log(`Could not get block details for ${tx.blockhash}`);
                }
                return null;
            }

            if(config.staking.debug){
                console.log(`Block details for ${tx.blockhash}:`, JSON.stringify(blockDetails, null, 2));
            }

            // Check if this is a proof-of-stake block
            if(!blockDetails.flags || blockDetails.flags !== 'proof-of-stake'){
                if(config.staking.debug){
                    console.log(`Block ${tx.blockhash} is not a proof-of-stake block (flags: ${blockDetails.flags})`);
                }
                return null;
            }

            // Check if block has mint value
            if(!blockDetails.mint || blockDetails.mint <= 0){
                if(config.staking.debug){
                    console.log(`Block ${tx.blockhash} has no mint value or mint is 0 (mint: ${blockDetails.mint})`);
                }
                return null;
            }

            const reward = parseFloat(blockDetails.mint.toFixed(8));

            if(config.staking.debug){
                console.log(`Block ${tx.blockhash} is proof-of-stake with mint: ${reward}`);
                console.log(`Transaction ${tx.txid} stake reward: ${reward}`);
            }

            return reward;

        } catch(error) {
            var errorMessage = "wallet_calculate_legacy_modern_stake_reward: Error getting block mint value";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return null;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Calculate stake reward for modern wallets with block flag detection
    /* ------------------------------------------------------------------------------ */

    wallet_calculate_modern_stake_reward: async function(tx){
        try {
            if(config.staking.debug){
                console.log(`Checking transaction: ${tx.txid}`);
                console.log(`Transaction structure:`, JSON.stringify(tx, null, 2));
            }

            // tx is already the transaction details from gettransaction
            if(!tx || !tx.blockhash){
                if(config.staking.debug){
                    console.log(`No transaction details or blockhash for ${tx.txid}`);
                }
                return { reward: null, isStake: false };
            }

            // Get the block details to check if it's proof-of-stake
            const blockDetails = await this.wallet_get_block(tx.blockhash);
            if(!blockDetails || !blockDetails.flags){
                if(config.staking.debug){
                    console.log(`No block details or flags for block ${tx.blockhash}`);
                }
                return { reward: null, isStake: false };
            }

            if(config.staking.debug){
                console.log(`Block flags: ${blockDetails.flags}`);
            }

            // Check if this is a proof-of-work block
            if(blockDetails.flags === 'proof-of-work'){
                if(config.staking.debug){
                    console.log(`Transaction ${tx.txid} is in a proof-of-work block`);
                }
                return { reward: null, isStake: false };
            }

            // Check if this is a proof-of-stake block
            if(blockDetails.flags !== 'proof-of-stake'){
                if(config.staking.debug){
                    console.log(`Transaction ${tx.txid} is not in a proof-of-stake block`);
                }
                return { reward: null, isStake: false };
            }

            if(config.staking.debug){
                console.log(`Transaction ${tx.txid} is in a proof-of-stake block`);
            }

            // Check if block has mint value
            if(!blockDetails.mint || blockDetails.mint <= 0){
                if(config.staking.debug){
                    console.log(`Block ${tx.blockhash} has no mint value or mint is 0 (mint: ${blockDetails.mint})`);
                }
                return { reward: null, isStake: true };
            }

            const reward = parseFloat(blockDetails.mint.toFixed(8));

            if(config.staking.debug){
                console.log(`Block ${tx.blockhash} is proof-of-stake with mint: ${reward}`);
                console.log(`Transaction ${tx.txid} stake reward: ${reward}`);
            }

            return { 
                reward: reward, 
                isStake: true 
            };

        } catch(error) {
            var errorMessage = "wallet_calculate_modern_stake_reward: Error calculating modern stake reward";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return { reward: null, isStake: false };
        }
    }

};