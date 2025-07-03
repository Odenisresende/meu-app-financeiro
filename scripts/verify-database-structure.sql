-- Verificar se as tabelas necessárias existem
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_subscriptions', 'transactions', 'profiles');

-- Verificar estrutura da tabela user_subscriptions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há dados de teste
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as status_active
FROM user_subscriptions;

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'user_subscriptions';
