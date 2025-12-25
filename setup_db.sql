-- Create new database and user for Yield Router
CREATE USER yield_router_user WITH PASSWORD 'yield_router_pass_2025';
CREATE DATABASE yield_router_db OWNER yield_router_user;
GRANT ALL PRIVILEGES ON DATABASE yield_router_db TO yield_router_user;
