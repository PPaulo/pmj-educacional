-- =====================================================================
-- 🛠️ SCRIPT DE EXCLUSÃO DE USUÁRIOS (RPC)
-- Copie e cole este script no painel (SQL Editor) do seu Supabase.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.delete_user_admin(user_id_param UUID)
RETURNS void AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- 1. Verifica se quem está chamando é um Admin
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role != 'Admin' THEN
     RAISE EXCEPTION 'Acesso negado: Apenas Administradores podem excluir usuários.';
  END IF;
  
  -- 2. Deleta o usuário da tabela Auth (Isso dispara cascata para o Profile)
  DELETE FROM auth.users WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
