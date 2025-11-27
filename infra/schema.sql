-- Schema for the client and transaction tables for AWS RDS (PostgreSQL)

-- Create a UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Clientes
-- Stores customer registration-related records
CREATE TABLE Clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    saldo DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comment on table Clientes
COMMENT ON TABLE Clientes IS 'Stores customer registration-related records';

-- Comment on columns of Clientes table
COMMENT ON COLUMN Clientes.id IS 'Unique identifier for the client (Primary Key)';
COMMENT ON COLUMN Clientes.nome IS 'Client''s full name';
COMMENT ON COLUMN Clientes.email IS 'Client''s email address (Unique)';
COMMENT ON COLUMN Clientes.saldo IS 'Client''s account balance';
COMMENT ON COLUMN Clientes.created_at IS 'Timestamp of when the client was created';
COMMENT ON COLUMN Clientes.updated_at IS 'Timestamp of when the client was last updated';


-- Table: Transacoes
-- Stores all financial transactions for customers
CREATE TABLE Transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('deposito', 'saque')),
    valor DECIMAL(15, 2) NOT NULL,
    data_transacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente
        FOREIGN KEY(cliente_id)
        REFERENCES Clientes(id)
        ON DELETE CASCADE
);

-- Comment on table Transacoes
COMMENT ON TABLE Transacoes IS 'Stores all financial transactions for customers';

-- Comment on columns of Transacoes table
COMMENT ON COLUMN Transacoes.id IS 'Unique identifier for the transaction (Primary Key)';
COMMENT ON COLUMN Transacoes.cliente_id IS 'Foreign key referencing the client''s ID';
COMMENT ON COLUMN Transacoes.tipo IS 'Type of transaction (e.g., ''deposito'', ''saque'')';
COMMENT ON COLUMN Transacoes.valor IS 'The amount of the transaction';
COMMENT ON COLUMN Transacoes.data_transacao IS 'Timestamp of when the transaction occurred';

-- Create a trigger to update the updated_at column on Clientes table
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Clientes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Example Queries

-- INSERT: Create new clients
INSERT INTO Clientes (nome, email, saldo) VALUES 
('João da Silva', 'joao.silva@example.com', 1000.00),
('Maria Oliveira', 'maria.oliveira@example.com', 2500.50),
('Carlos Pereira', 'carlos.pereira@example.com', 500.00),
('Ana Souza', 'ana.souza@example.com', 12000.00),
('Pedro Santos', 'pedro.santos@example.com', 0.00),
('Fernanda Lima', 'fernanda.lima@example.com', 3450.75),
('Roberto Costa', 'roberto.costa@example.com', 150.20),
('Juliana Martins', 'juliana.martins@example.com', 8900.10),
('Lucas Almeida', 'lucas.almeida@example.com', 450.00),
('Beatriz Rocha', 'beatriz.rocha@example.com', 6700.00);

-- SELECT: Retrieve all clients
SELECT id, nome, email, saldo, created_at, updated_at
FROM Clientes;
