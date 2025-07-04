-- Melhorar tabela de webhook_logs para debug
ALTER TABLE webhook_logs 
ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS processing_time INTEGER,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);

-- Inserir log de teste para verificar se está funcionando
INSERT INTO webhook_logs (
  event_type, 
  data, 
  processed, 
  created_at
) VALUES (
  'debug_test',
  '{"message": "Tabela de logs configurada com sucesso!", "timestamp": "' || NOW() || '"}',
  true,
  NOW()
);

-- Verificar se inseriu corretamente
SELECT 
  event_type,
  data,
  created_at
FROM webhook_logs 
WHERE event_type = 'debug_test'
ORDER BY created_at DESC 
LIMIT 1;
