-- Criar tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  webhook_data JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  source VARCHAR(50) DEFAULT 'mercadopago',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);

-- Habilitar RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de webhooks
CREATE POLICY "Allow webhook inserts" ON webhook_logs
  FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de webhooks
CREATE POLICY "Allow webhook reads" ON webhook_logs
  FOR SELECT USING (true);

-- Política para permitir atualização de webhooks
CREATE POLICY "Allow webhook updates" ON webhook_logs
  FOR UPDATE USING (true);
