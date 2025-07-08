//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var log = require("./log.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// https://github.com/typicode/lowdb
// lowdb for content that is not as important but needs to be queried fast
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// Create adapter and database
const file = path.join(process.cwd(), 'lowdb', 'lowdb.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

// Initialize database
(async () => {
    await db.read();
    db.data ||= {};
    await db.write();
})();

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Write to local storage
    /* ------------------------------------------------------------------------------ */

    storage_write_local_storage: async function(userID, valueName, value) {
        try {
            await db.read();
            if (!db.data[userID]) {
                db.data[userID] = {};
            }
            db.data[userID][valueName] = value;
            await db.write();
            return true;
        } catch (error) {
            var errorMessage = "storage_write_local_storage: Can't write to local storage.";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return false;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Delete from local storage
    /* ------------------------------------------------------------------------------ */

    storage_delete_local_storage: async function(userID, valueName) {
        try {
            await db.read();
            if (db.data[userID] && db.data[userID][valueName]) {
                delete db.data[userID][valueName];
                await db.write();
            }
            return true;
        } catch (error) {
            var errorMessage = "storage_delete_local_storage: Can't delete from local storage.";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return false;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Read from local storage
    /* ------------------------------------------------------------------------------ */

    storage_read_local_storage: async function(userID, valueName) {    
        try {
            await db.read();
            if (db.data[userID] && db.data[userID][valueName]) {
                return db.data[userID][valueName];
            }
            return undefined;
        } catch (error) {
            var errorMessage = "storage_read_local_storage: Can't read from local storage.";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return false;
        }
    }

};