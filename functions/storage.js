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
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Create adapter and database
const file = path.join(process.cwd(), 'lowdb', 'lowdb.json');
const adapter = new FileSync(file);
const db = low(adapter);

// Set defaults (runs only once)
db.defaults({}).write();

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Write to local storage
    /* ------------------------------------------------------------------------------ */

    storage_write_local_storage: function(userID, valueName, value) {
        try {
            if (!db.has(userID).value()) {
                db.set(userID, {}).write();
            }
            db.set(`${userID}.${valueName}`, value).write();
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

    storage_delete_local_storage: function(userID, valueName) {
        try {
            if (db.has(`${userID}.${valueName}`).value()) {
                db.unset(`${userID}.${valueName}`).write();
                
                // Clean up empty user objects
                if (db.has(userID).value() && Object.keys(db.get(userID).value()).length === 0) {
                    db.unset(userID).write();
                }
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

    storage_read_local_storage: function(userID, valueName) {    
        try {
            if (db.has(`${userID}.${valueName}`).value()) {
                return db.get(`${userID}.${valueName}`).value();
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
    },

    /* ------------------------------------------------------------------------------ */
    // Get all user data (for debugging/admin purposes)
    /* ------------------------------------------------------------------------------ */

    storage_get_all_users: function() {
        try {
            return db.getState() || {};
        } catch (error) {
            var errorMessage = "storage_get_all_users: Can't read all users from local storage.";
            if(config.bot.errorLogging){
                log.log_write_file(errorMessage);
                log.log_write_file(error);
            }
            log.log_write_console(errorMessage);
            log.log_write_console(error);
            return {};
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Clear all data for a user
    /* ------------------------------------------------------------------------------ */

    storage_clear_user_data: function(userID) {
        try {
            if (db.has(userID).value()) {
                db.unset(userID).write();
            }
            return true;
        } catch (error) {
            var errorMessage = "storage_clear_user_data: Can't clear user data from local storage.";
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