-- =====================================================
-- PASSO 1: CRIAR ESTRUTURA BÁSICA DAS TABELAS
-- =====================================================

-- 1. CRIAR TABELA PROFILES (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    whatsapp_number text,
    whatsapp_opt_in boolean DEFAULT false,
    whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ADICIONAR COLUNAS WHATSAPP EM PROFILES (se não existirem)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb;

-- 3. CRIAR TABELA USER_SUBSCRIPTIONS (se não existir)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id text UNIQUE,
    plan_type text DEFAULT 'trial',
    status text DEFAULT 'active',
    amount decimal(10,2) DEFAULT 17.00,
    currency text DEFAULT 'BRL',
    billing_cycle text DEFAULT 'monthly',
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    expires_at timestamp with time zone,
    subscription_start_date timestamp with time zone,
    subscription_end_date timestamp with time zone,
    cancelled_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ADICIONAR COLUNA BILLING_CYCLE (se não existir)
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';

-- 5. CRIAR TABELA TRANSACTIONS (se não existir)
CREATE TABLE IF NOT EXISTS public.transactions (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    category text NOT NULL,
    amount decimal(10,2) NOT NULL,
    type text NOT NULL,
    description text,
    source text DEFAULT 'manual',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CRIAR TABELA WEBHOOK_LOGS (se não existir)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    payload jsonb,
    data jsonb,
    processed boolean DEFAULT false,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
