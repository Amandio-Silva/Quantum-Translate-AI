-- Remover a política antiga de inserção (se existir, com o nome original)
DROP POLICY IF EXISTS "Users can insert own translations" ON translations;

-- Remover a política de inserção que permite anônimos (se já tiver sido criada com esse nome)
DROP POLICY IF EXISTS "Allow authenticated or anonymous inserts" ON translations;

-- Criar a política que permite inserções por usuários autenticados (para suas próprias traduções)
-- OU por usuários anônimos (onde user_id será NULL)
CREATE POLICY "Allow authenticated or anonymous inserts" ON translations
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
