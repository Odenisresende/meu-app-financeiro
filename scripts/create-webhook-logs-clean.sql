-- CRIAR TABELA DE LOGS DE WEBHOOKS
CREATE TABLE webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_type VARCHAR(50) DEFAULT 'mercadopago',
    event_type VARCHAR(100),
    data JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_webhook_logs_received_at ON webhook_logs(received_at);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX idx_webhook_logs_webhook_type ON webhook_logs(webhook_type);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);

-- Índice para busca no JSON
CREATE INDEX idx_webhook_logs_data_payment_id ON webhook_logs USING GIN ((data->'data'->>'id'));

-- Comentários para documentação
COMMENT ON TABLE webhook_logs IS 'Logs de todos os webhooks recebidos do Mercado Pago';
COMMENT ON COLUMN webhook_logs.data IS 'Dados completos do webhook em formato JSON';
COMMENT ON COLUMN webhook_logs.processed IS 'Se o webhook foi processado com sucesso';
