-- Remover a política antiga de inserção (se existir)
DROP POLICY IF EXISTS "Users can insert own translations" ON translations;

-- Remover a nova política de inserção (se já tiver sido criada)
DROP POLICY IF EXISTS "Allow authenticated or anonymous inserts" ON translations;

-- Criar uma nova política que permite inserções por usuários autenticados (para suas próprias traduções)
-- OU por usuários anônimos (onde user_id será NULL)
CREATE POLICY "Allow authenticated or anonymous inserts" ON translations
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
