-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICA PARA user_subscriptions
-- Permite que qualquer usuário autenticado acesse suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR ALL USING (auth.uid()::text = user_id);

-- POLÍTICA PARA webhook_logs  
-- Permite acesso total para service_role (APIs do servidor)
CREATE POLICY "Service role can access webhook_logs" ON webhook_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Permite acesso anônimo para inserção de webhooks (necessário para Mercado Pago)
CREATE POLICY "Allow webhook insertion" ON webhook_logs
    FOR INSERT WITH CHECK (true);

-- COMENTÁRIOS
COMMENT ON POLICY "Users can view own subscriptions" ON user_subscriptions IS 'Usuários só veem suas próprias assinaturas';
COMMENT ON POLICY "Service role can access webhook_logs" ON webhook_logs IS 'APIs do servidor têm acesso total aos logs';
COMMENT ON POLICY "Allow webhook insertion" ON webhook_logs IS 'Permite Mercado Pago inserir webhooks';
