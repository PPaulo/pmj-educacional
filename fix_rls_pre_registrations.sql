-- ==========================================
-- SCRIPT DE CORREÇÃO PARA PRÉ-MATRÍCULAS
-- ==========================================
-- O erro ocorre porque a tabela `pre_registrations` não possui políticas RLS de LEITURA (SELECT) 
-- para o papel anônimo (anon), o que impede o Dashboard de carregar as solicitações (retorna 0 linhas).
--
-- Para aplicar:
-- 1. Copie o script abaixo
-- 2. Cole no SQL Editor do seu Dashboard do Supabase
-- 3. Clique em RUN

-- Habilitar Row Level Security (RLS)
ALTER TABLE IF EXISTS pre_registrations ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 1. POLÍTICA DE INSERÇÃO (INSERT)
-- Permite que qualquer usuário no Portal de Vagas envie uma solicitação
-- --------------------------------------------------
DROP POLICY IF EXISTS "Inserção pública de pré-matrícula" ON pre_registrations;
CREATE POLICY "Inserção pública de pré-matrícula"
ON pre_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- --------------------------------------------------
-- 2. POLÍTICA DE LEITURA (SELECT)
-- Permite que o Dashboard (e a consulta por CPF) leia os dados
-- --------------------------------------------------
DROP POLICY IF EXISTS "Leitura de pré-matrículas" ON pre_registrations;
CREATE POLICY "Leitura de pré-matrículas"
ON pre_registrations FOR SELECT
TO anon, authenticated
USING (true);

-- --------------------------------------------------
-- 3. POLÍTICA DE ATUALIZAÇÃO (UPDATE)
-- Permite que administradores aprovem ou reprovem a solicitação
-- --------------------------------------------------
DROP POLICY IF EXISTS "Atualização por gestores" ON pre_registrations;
CREATE POLICY "Atualização por gestores"
ON pre_registrations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------
-- 4. POLÍTICA DE DELEÇÃO (DELETE)
-- Apenas usuários autenticados (Gestores)
-- --------------------------------------------------
DROP POLICY IF EXISTS "Exclusão por gestores" ON pre_registrations;
CREATE POLICY "Exclusão por gestores"
ON pre_registrations FOR DELETE
TO authenticated
USING (true);
