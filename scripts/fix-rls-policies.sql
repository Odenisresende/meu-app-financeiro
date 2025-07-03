-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTAR
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS EXISTENTES QUE PODEM ESTAR BLOQUEANDO
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can access webhook_logs" ON webhook_logs;
DROP POLICY IF EXISTS "Allow webhook insertion" ON webhook_logs;

-- CRIAR POLÍTICAS MAIS PERMISSIVAS PARA TESTE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICA PERMISSIVA PARA PROFILES
CREATE POLICY "Allow all access to profiles" ON profiles
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICA PERMISSIVA PARA TRANSACTIONS  
CREATE POLICY "Allow all access to transactions" ON transactions
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICA PERMISSIVA PARA USER_SUBSCRIPTIONS
CREATE POLICY "Allow all access to user_subscriptions" ON user_subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICA PERMISSIVA PARA WEBHOOK_LOGS
CREATE POLICY "Allow all access to webhook_logs" ON webhook_logs
    FOR ALL USING (true) WITH CHECK (true);

-- VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'transactions', 'user_subscriptions', 'webhook_logs')
ORDER BY tablename, policyname;
