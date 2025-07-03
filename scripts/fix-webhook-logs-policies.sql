-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow webhook inserts" ON webhook_logs;
DROP POLICY IF EXISTS "Allow webhook reads" ON webhook_logs;
DROP POLICY IF EXISTS "Allow webhook updates" ON webhook_logs;

-- Recriar políticas corretamente
CREATE POLICY "Allow webhook inserts" ON webhook_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow webhook reads" ON webhook_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow webhook updates" ON webhook_logs
  FOR UPDATE USING (true);

-- Verificar se a tabela existe e tem a estrutura correta
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'webhook_logs' 
ORDER BY ordinal_position;
