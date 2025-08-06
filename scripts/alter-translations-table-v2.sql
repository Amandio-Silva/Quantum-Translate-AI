-- Alterar a tabela translations para permitir user_id nulo
ALTER TABLE translations
ALTER COLUMN user_id DROP NOT NULL;
