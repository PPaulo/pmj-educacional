-- Tabela de Lançamento de Notas e Faltas (Grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade LOGICAL, -- ou NUMERIC
    absences INTEGER DEFAULT 0,
    period TEXT DEFAULT '1º Bimestre', -- Ex: 1º Bimestre, 2º Bimestre...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alterando tipo para NUMERIC caso dê erro em alguns motores
ALTER TABLE public.grades ALTER COLUMN grade TYPE NUMERIC USING grade::numeric;

-- Habilitar RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público Total para Testes
CREATE POLICY "Public full access grades" ON public.grades FOR ALL USING (true);
