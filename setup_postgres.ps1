# PowerShell script to setup PostgreSQL database for Yield Router

# Step 1: Backup pg_hba.conf
$pgDataDir = "C:\Program Files\PostgreSQL\17\data"
$pgHbaConf = Join-Path $pgDataDir "pg_hba.conf"
$pgHbaBackup = Join-Path $pgDataDir "pg_hba.conf.backup"

Write-Host "Backing up pg_hba.conf..."
Copy-Item $pgHbaConf $pgHbaBackup -Force

# Step 2: Modify pg_hba.conf to allow trust authentication
Write-Host "Modifying pg_hba.conf to allow trust authentication..."
$content = Get-Content $pgHbaConf
$newContent = $content -replace 'host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
$newContent = $newContent -replace 'host\s+all\s+all\s+::1/128\s+scram-sha-256', 'host    all             all             ::1/128                 trust'
$newContent | Set-Content $pgHbaConf

# Step 3: Restart PostgreSQL service
Write-Host "Restarting PostgreSQL service..."
Restart-Service postgresql-x64-17

# Wait for service to start
Start-Sleep -Seconds 3

# Step 4: Create database and user
Write-Host "Creating database and user..."
$env:PGPASSWORD = ""
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "CREATE USER yield_router_user WITH PASSWORD 'yield_router_pass_2025';"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "CREATE DATABASE yield_router_db OWNER yield_router_user;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE yield_router_db TO yield_router_user;"

# Step 5: Restore pg_hba.conf
Write-Host "Restoring pg_hba.conf..."
Copy-Item $pgHbaBackup $pgHbaConf -Force

# Step 6: Restart PostgreSQL service again
Write-Host "Restarting PostgreSQL service..."
Restart-Service postgresql-x64-17

Write-Host "Database setup complete!"
Write-Host "Database: yield_router_db"
Write-Host "User: yield_router_user"
Write-Host "Password: yield_router_pass_2025"
