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

// Mysql2
const mysql = require('mysql2');
// connect mysql database
const mysqlPool = mysql.createPool({
    connectionLimit : config.mysql.connectionLimit,
    waitForConnections: config.mysql.waitForConnections,
    host     : config.mysql.dbHost,
    user     : config.mysql.dbUser,
    port     : config.mysql.dbPort,
    password : config.mysql.dbPassword,
    database : config.mysql.dbName
});

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Run all database migrations
    /* ------------------------------------------------------------------------------ */
    run_migrations: async function(){
        console.log('Running database migrations...');
        
        try {
            await this.add_block_column_to_transactions();
            console.log('All database migrations completed successfully.');
        } catch (error) {
            console.error('Database migration failed:', error);
            throw error;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Add block column to transactions table if it doesn't exist
    /* ------------------------------------------------------------------------------ */
    add_block_column_to_transactions: function(){
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try {
                        mysqlPool.releaseConnection(connection);
                    } catch (e){}
                    var errorMessage = "add_block_column_to_transactions: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    reject(error);
                    return;
                }

                // Check if block column exists
                connection.execute("SHOW COLUMNS FROM transactions LIKE 'block'", [], function (error, results, fields){
                    if(error){
                        mysqlPool.releaseConnection(connection);
                        var errorMessage = "add_block_column_to_transactions: MySQL query problem checking for block column.";
                        if(config.bot.errorLogging){
                            log.log_write_file(errorMessage);
                            log.log_write_file(error);
                        }
                        log.log_write_console(errorMessage);
                        log.log_write_console(error);
                        reject(error);
                        return;
                    }

                    if(results.length === 0){
                        // Column doesn't exist, add it
                        console.log('Adding block column to transactions table...');
                        connection.execute("ALTER TABLE transactions ADD COLUMN block VARCHAR(64) DEFAULT NULL", [], function (error, results, fields){
                            mysqlPool.releaseConnection(connection);
                            if(error){
                                var errorMessage = "add_block_column_to_transactions: MySQL query problem adding block column.";
                                if(config.bot.errorLogging){
                                    log.log_write_file(errorMessage);
                                    log.log_write_file(error);
                                }
                                log.log_write_console(errorMessage);
                                log.log_write_console(error);
                                reject(error);
                                return;
                            }
                            console.log('Successfully added block column to transactions table.');
                            resolve(true);
                        });
                    } else {
                        // Column already exists
                        mysqlPool.releaseConnection(connection);
                        console.log('Block column already exists in transactions table.');
                        resolve(true);
                    }
                });
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Check database schema and suggest manual fixes if needed
    /* ------------------------------------------------------------------------------ */
    check_database_schema: function(){
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try {
                        mysqlPool.releaseConnection(connection);
                    } catch (e){}
                    console.error('Cannot connect to database to check schema.');
                    reject(error);
                    return;
                }

                connection.execute("DESCRIBE transactions", [], function (error, results, fields){
                    mysqlPool.releaseConnection(connection);
                    if(error){
                        console.error('Cannot describe transactions table:', error);
                        reject(error);
                        return;
                    }

                    console.log('\nCurrent transactions table structure:');
                    results.forEach(column => {
                        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
                    });

                    const hasBlockColumn = results.some(column => column.Field === 'block');
                    if(!hasBlockColumn){
                        console.log('\n⚠️  MISSING COLUMN DETECTED!');
                        console.log('The "block" column is missing from the transactions table.');
                        console.log('\nTo fix this manually, run this SQL command:');
                        console.log('ALTER TABLE transactions ADD COLUMN block VARCHAR(64) DEFAULT NULL;');
                        console.log('\nOr restart the bot to run automatic migration.');
                    }

                    resolve(hasBlockColumn);
                });
            });
        });
    }
};