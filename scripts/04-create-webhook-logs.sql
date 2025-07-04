-- =====================================================
-- 📝 TABELA DE LOGS DE WEBHOOKS
-- =====================================================

-- 1. Criar tabela de logs de webhooks
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type TEXT NOT NULL CHECK (webhook_type IN ('mercadopago', 'whatsapp')),
    event_type TEXT,
    payload JSONB,
    headers JSONB,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON public.webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON public.webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- 3. Índice para busca no JSON
CREATE INDEX IF NOT EXISTS idx_webhook_logs_data_payment_id ON public.webhook_logs USING GIN ((payload->'data'->>'id'));

-- 4. Comentários para documentação
COMMENT ON TABLE public.webhook_logs IS 'Logs de todos os webhooks recebidos';
COMMENT ON COLUMN public.webhook_logs.payload IS 'Dados completos do webhook em formato JSON';
COMMENT ON COLUMN public.webhook_logs.processed IS 'Se o webhook foi processado com sucesso';

-- 5. Habilitar RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 6. Política para permitir inserção de webhooks (sem autenticação)
DROP POLICY IF EXISTS "Permitir inserção de webhooks" ON public.webhook_logs;
CREATE POLICY "Permitir inserção de webhooks"
    ON public.webhook_logs FOR INSERT
    WITH CHECK (true);

-- 7. Política para leitura apenas por usuários autenticados (para debug)
DROP POLICY IF EXISTS "Usuários autenticados podem ver logs" ON public.webhook_logs;
CREATE POLICY "Usuários autenticados podem ver logs"
    ON public.webhook_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ✅ TABELA DE WEBHOOK LOGS CRIADA COM SUCESSO
