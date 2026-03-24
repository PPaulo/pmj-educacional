-- =====================================================================
-- 🛡️ SISTEMA DE AUDITORIA AUTOMÁTICA (LOGS DE ALTERAÇÃO)
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- 1. Criação da Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id), -- Quem fez a alteração (vazio se for sistema)
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL, -- Tabela afetada
    record_id UUID, -- ID do registro afetado (Opceional/Casting)
    details JSONB, -- JSON com o estado novo ou antigo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nela (Apenas Admins podem ler os logs!)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only Admin Read Logs" ON public.audit_logs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 2. Função de Trigger Geral para Auditoria
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS trigger AS $$
DECLARE
    current_uid UUID;
    action_type TEXT := TG_OP;
    json_data JSONB;
    rec_id UUID;
BEGIN
    -- Pegar o UID do usuário logado via Supabase Authentication
    BEGIN
        current_uid := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_uid := NULL; -- Chamadas por cron ou sistema
    END;

    -- Salvar os dados baseados na operação
    IF action_type = 'DELETE' THEN
        json_data := row_to_json(OLD)::jsonb;
        -- Tentando extrair ID se disponível
        BEGIN rec_id := OLD.id; EXCEPTION WHEN OTHERS THEN rec_id := NULL; END;
    ELSE
        json_data := row_to_json(NEW)::jsonb;
        BEGIN rec_id := NEW.id; EXCEPTION WHEN OTHERS THEN rec_id := NULL; END;
    END IF;

    -- Inserir o log
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, details)
    VALUES (current_uid, action_type, TG_TABLE_NAME, rec_id, json_data);

    IF action_type = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplicando o Trigger em Tabelas Sensíveis
-- A. Estudantes
DROP TRIGGER IF EXISTS tr_audit_students ON public.students;
CREATE TRIGGER tr_audit_students AFTER INSERT OR UPDATE OR DELETE ON public.students FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- B. Turmas (Classes)
DROP TRIGGER IF EXISTS tr_audit_classes ON public.classes;
CREATE TRIGGER tr_audit_classes AFTER INSERT OR UPDATE OR DELETE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- C. Funcionários (Employees)
DROP TRIGGER IF EXISTS tr_audit_employees ON public.employees;
CREATE TRIGGER tr_audit_employees AFTER INSERT OR UPDATE OR DELETE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- D. Notas (Grades)
DROP TRIGGER IF EXISTS tr_audit_grades ON public.grades;
CREATE TRIGGER tr_audit_grades AFTER INSERT OR UPDATE OR DELETE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.log_changes();
