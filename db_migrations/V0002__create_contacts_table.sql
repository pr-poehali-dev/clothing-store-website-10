-- Create contacts table for store information
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default contacts
INSERT INTO contacts (address, phone, email) 
VALUES ('Москва, ул. Модная, 123', '+7 (999) 123-45-67', 'hello@vibestore.com');