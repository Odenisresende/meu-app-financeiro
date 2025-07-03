-- Script para remover conta específica: odenisresende@gmail.com
-- CUIDADO: Este script remove TODOS os dados do usuário

-- 1. Buscar o ID do usuário
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'odenisresende@gmail.com';

-- 2. Remover transações do usuário
DELETE FROM public.transactions 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'odenisresende@gmail.com'
);

-- 3. Remover assinaturas do usuário
DELETE FROM public.user_subscriptions 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'odenisresende@gmail.com'
);

-- 4. Remover perfil do usuário
DELETE FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'odenisresende@gmail.com'
);

-- 5. Remover usuário da autenticação (CUIDADO: Irreversível)
DELETE FROM auth.users 
WHERE email = 'odenisresende@gmail.com';

-- 6. Verificar se foi removido
SELECT 'Usuário removido com sucesso!' as status
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'odenisresende@gmail.com'
);
