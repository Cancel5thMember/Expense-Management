-- Create database and dedicated user for the app
CREATE DATABASE IF NOT EXISTS cancel5th CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create app user (adjust password as needed)
CREATE USER IF NOT EXISTS 'trae_admin'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges to app user on the database
GRANT ALL PRIVILEGES ON cancel5th.* TO 'trae_admin'@'localhost';
FLUSH PRIVILEGES;