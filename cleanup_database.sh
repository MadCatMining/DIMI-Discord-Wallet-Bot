#!/bin/bash

#######################################################################
# Database Cleanup Script
# This script backs up the database and cleans up log, payments, 
# and transactions tables, keeping only the latest 1000 rows in each.
#######################################################################

# Config file path and name
filepath=$(dirname "$0")
file="$filepath/config.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

#######################################################################
# Check if config file exists
#######################################################################

if [[ ! -f "$file" ]]; then
    print_error "Config file not found: $file"
    exit 1
fi

#######################################################################
# Read database connection info from config file
#######################################################################

print_status "Reading database configuration..."

while IFS= read -r line
do
    if [[ $line == *"dbHost"* ]]; then
        dbhost="$line"
    fi
    if [[ $line == *"dbName"* ]]; then
        dbName="$line"
    fi
    if [[ $line == *"dbUser"* ]]; then
        dbUser="$line"
    fi
    if [[ $line == *"dbPassword"* ]]; then
        dbPassword="$line"
    fi
    if [[ $line == *"dbPort"* ]]; then
        dbPort="$line"
    fi
done <"$file"

#######################################################################
# Validate database connection parameters
#######################################################################

if [[ -z "$dbhost" ]]; then
    print_error "dbhost not defined in config file."
    exit 1
fi
if [[ -z "$dbName" ]]; then
    print_error "dbName not defined in config file."
    exit 1
fi
if [[ -z "$dbUser" ]]; then
    print_error "dbUser not defined in config file."
    exit 1
fi
if [[ -z "$dbPassword" ]]; then
    print_error "dbPassword not defined in config file."
    exit 1
fi
if [[ -z "$dbPort" ]]; then
    print_error "dbPort not defined in config file."
    exit 1
fi

#######################################################################
# Parse database connection strings
#######################################################################

dbhost=$(echo $dbhost | sed 's/^.*dbHost"//' | grep -o -P '(?<=").*(?=")')
dbName=$(echo $dbName | sed 's/^.*dbName"//' | grep -o -P '(?<=").*(?=")')
dbUser=$(echo $dbUser | sed 's/^.*dbUser"//' | grep -o -P '(?<=").*(?=")')
dbPassword=$(echo $dbPassword | sed 's/^.*dbPassword"//' | grep -o -P '(?<=").*(?=")')
dbPort=$(echo "${dbPort//[!0-9]/}")

#######################################################################
# Validate parsed parameters
#######################################################################

if [[ -z "$dbhost" ]]; then
    print_error "Failed to parse dbhost from config file."
    exit 1
fi
if [[ -z "$dbName" ]]; then
    print_error "Failed to parse dbName from config file."
    exit 1
fi
if [[ -z "$dbUser" ]]; then
    print_error "Failed to parse dbUser from config file."
    exit 1
fi
if [[ -z "$dbPassword" ]]; then
    print_error "Failed to parse dbPassword from config file."
    exit 1
fi
if [[ -z "$dbPort" ]]; then
    print_error "Failed to parse dbPort from config file."
    exit 1
fi

print_success "Database configuration loaded successfully."
print_status "Host: $dbhost:$dbPort"
print_status "Database: $dbName"
print_status "User: $dbUser"

#######################################################################
# Test database connection
#######################################################################

print_status "Testing database connection..."

mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -e "SELECT 1;" 2>/dev/null

if [ $? -ne 0 ]; then
    print_error "Failed to connect to database. Please check your configuration."
    exit 1
fi

print_success "Database connection successful."

#######################################################################
# Create backup directory if it doesn't exist
#######################################################################

backup_dir="$filepath/database_backups"
if [[ ! -d "$backup_dir" ]]; then
    mkdir -p "$backup_dir"
    print_status "Created backup directory: $backup_dir"
fi

#######################################################################
# Create database backup
#######################################################################

timestamp=$(date '+%Y%m%d_%H%M%S')
backup_file="$backup_dir/${dbName}_backup_${timestamp}.sql"

print_status "Creating database backup..."
print_status "Backup file: $backup_file"

mysqldump --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort \
    --single-transaction --routines --triggers $dbName > "$backup_file" 2>/dev/null

if [ $? -ne 0 ]; then
    print_error "Database backup failed!"
    exit 1
fi

# Check if backup file was created and has content
if [[ ! -f "$backup_file" ]] || [[ ! -s "$backup_file" ]]; then
    print_error "Backup file is empty or was not created!"
    exit 1
fi

backup_size=$(du -h "$backup_file" | cut -f1)
print_success "Database backup completed successfully."
print_status "Backup size: $backup_size"

#######################################################################
# Get current row counts before cleanup
#######################################################################

print_status "Getting current row counts..."

log_count=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM log;" 2>/dev/null)
payments_count=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM payments;" 2>/dev/null)
transactions_count=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM transactions;" 2>/dev/null)

print_status "Current row counts:"
print_status "  log: $log_count rows"
print_status "  payments: $payments_count rows"
print_status "  transactions: $transactions_count rows"

#######################################################################
# Clean up log table
#######################################################################

if [[ $log_count -gt 1000 ]]; then
    rows_to_delete=$((log_count - 1000))
    print_status "Cleaning up log table (removing $rows_to_delete oldest rows)..."
    
    mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName 2>/dev/null << EOF
DELETE FROM log 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id FROM log 
        ORDER BY id DESC 
        LIMIT 1000
    ) AS keep_rows
);
EOF

    if [ $? -eq 0 ]; then
        print_success "Log table cleanup completed."
    else
        print_error "Log table cleanup failed!"
        exit 1
    fi
else
    print_status "Log table has $log_count rows (≤ 1000), no cleanup needed."
fi

#######################################################################
# Clean up payments table
#######################################################################

if [[ $payments_count -gt 1000 ]]; then
    rows_to_delete=$((payments_count - 1000))
    print_status "Cleaning up payments table (removing $rows_to_delete oldest rows)..."
    
    mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName 2>/dev/null << EOF
DELETE FROM payments 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id FROM payments 
        ORDER BY id DESC 
        LIMIT 1000
    ) AS keep_rows
);
EOF

    if [ $? -eq 0 ]; then
        print_success "Payments table cleanup completed."
    else
        print_error "Payments table cleanup failed!"
        exit 1
    fi
else
    print_status "Payments table has $payments_count rows (≤ 1000), no cleanup needed."
fi

#######################################################################
# Clean up transactions table
#######################################################################

if [[ $transactions_count -gt 1000 ]]; then
    rows_to_delete=$((transactions_count - 1000))
    print_status "Cleaning up transactions table (removing $rows_to_delete oldest rows)..."
    
    mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName 2>/dev/null << EOF
DELETE FROM transactions 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id FROM transactions 
        ORDER BY id DESC 
        LIMIT 1000
    ) AS keep_rows
);
EOF

    if [ $? -eq 0 ]; then
        print_success "Transactions table cleanup completed."
    else
        print_error "Transactions table cleanup failed!"
        exit 1
    fi
else
    print_status "Transactions table has $transactions_count rows (≤ 1000), no cleanup needed."
fi

#######################################################################
# Get final row counts after cleanup
#######################################################################

print_status "Getting final row counts..."

log_count_final=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM log;" 2>/dev/null)
payments_count_final=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM payments;" 2>/dev/null)
transactions_count_final=$(mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName -se "SELECT COUNT(*) FROM transactions;" 2>/dev/null)

print_status "Final row counts:"
print_status "  log: $log_count_final rows"
print_status "  payments: $payments_count_final rows"
print_status "  transactions: $transactions_count_final rows"

#######################################################################
# Clean up old backups (keep only last 10 backups)
#######################################################################

print_status "Cleaning up old backups (keeping last 10)..."

cd "$backup_dir"
backup_count=$(ls -1 ${dbName}_backup_*.sql 2>/dev/null | wc -l)

if [[ $backup_count -gt 10 ]]; then
    ls -1t ${dbName}_backup_*.sql | tail -n +11 | xargs rm -f
    removed_count=$((backup_count - 10))
    print_status "Removed $removed_count old backup files."
else
    print_status "Found $backup_count backup files (≤ 10), no cleanup needed."
fi

#######################################################################
# Summary
#######################################################################

print_success "Database cleanup completed successfully!"
print_status "Summary:"
print_status "  Backup created: $backup_file ($backup_size)"
print_status "  Log rows: $log_count → $log_count_final"
print_status "  Payment rows: $payments_count → $payments_count_final"
print_status "  Transaction rows: $transactions_count → $transactions_count_final"

exit 0