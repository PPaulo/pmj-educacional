-- =====================================================================
-- 🛡️ SCRIPT DE ATUALIZAÇÃO DE SEGURANÇA (RLS SEGURA)
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- 🌟 1. LIMPEZA: Apagar as políticas de acesso público (Teste) antigas
DROP POLICY IF EXISTS "Full Access Employees" ON public.employees;
DROP POLICY IF EXISTS "Full Access Classes" ON public.classes;
DROP POLICY IF EXISTS "Full Access Students" ON public.students;
DROP POLICY IF EXISTS "Full Access Events" ON public.events;
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Full Access Plannings" ON public.plannings;
DROP POLICY IF EXISTS "Full Access Attendance" ON public.attendance;
DROP POLICY IF EXISTS "Full Access Grades" ON public.grades;

-- 🌟 2. POLÍTICAS SEGURAS (Permissões por Função e Escola)

-- 🏠 [TABELA] PERFIS (Profiles)
CREATE POLICY "Secure Access Profiles" ON public.profiles
  FOR ALL
  USING (
    -- Usuário logado pode ler qualquer um (para carregar nomes)
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    -- Só admin ou o próprio usuário pode se atualizar
    auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- 🎒 [TABELA] ESTUDANTES (Students)
CREATE POLICY "Secure Access Students" ON public.students
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      OR
      students.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 🏫 [TABELA] TURMAS (Classes)
CREATE POLICY "Secure Access Classes" ON public.classes
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      OR
      classes.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 👨‍🏫 [TABELA] FUNCIONÁRIOS (Employees)
CREATE POLICY "Secure Access Employees" ON public.employees
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      OR
      employees.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 📝 [TABELA] NOTAS E PRESENÇAS (Grades e Attendance)
CREATE POLICY "Secure Access Grades" ON public.grades FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.classes c 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = grades.class_id AND (p.role = 'Admin' OR c.school_id = p.school_id)
    )
);

CREATE POLICY "Secure Access Attendance" ON public.attendance FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.classes c 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = attendance.class_id AND (p.role = 'Admin' OR c.school_id = p.school_id)
    )
);
