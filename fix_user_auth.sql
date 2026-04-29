-- =====================================================================
-- 🚀 CORREÇÃO DE SINCRONIZAÇÃO DE USUÁRIOS (AUTH -> PUBLIC.PROFILES)
-- Execute este script no SQL Editor do seu Supabase para corrigir o erro
-- de usuários que não aparecem na lista ou não salvam dados de login.
-- =====================================================================

-- 1. Garantir que a tabela profiles tem todas as colunas necessárias
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Atualizar a função handle_new_user para capturar metadados corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, school_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'), 
    COALESCE(new.raw_user_meta_data->>'role', 'Secretaria'),
    (new.raw_user_meta_data->>'school_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o gatilho para garantir que ele dispare após cada novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. (Opcional) Migrar usuários que já foram criados mas não têm perfil
INSERT INTO public.profiles (id, name, role, school_id)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'name', 'Usuário Antigo'), 
    COALESCE(raw_user_meta_data->>'role', 'Secretaria'),
    (raw_user_meta_data->>'school_id')::uuid
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Criar Função RPC para Exclusão de Usuários (necessária para o painel adm)
CREATE OR REPLACE FUNCTION delete_user_admin(user_id_param UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_user_admin IS 'Permite que o admin exclua usuários da tabela auth.users via RPC';
