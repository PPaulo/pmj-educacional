-- Script para atualizar a tabela 'students' no painel do Supabase (SQL Editor)

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS "codAluno" TEXT,
ADD COLUMN IF NOT EXISTS "rg" TEXT,
ADD COLUMN IF NOT EXISTS "orgaoExp" TEXT,
ADD COLUMN IF NOT EXISTS "dataExp" TEXT,
ADD COLUMN IF NOT EXISTS "tipoCertidao" TEXT,
ADD COLUMN IF NOT EXISTS "modeloCertidao" TEXT,
ADD COLUMN IF NOT EXISTS "certidaoNumero" TEXT,
ADD COLUMN IF NOT EXISTS "certidaoData" TEXT,
ADD COLUMN IF NOT EXISTS "alergias" TEXT,
ADD COLUMN IF NOT EXISTS "tipoSanguineo" TEXT,
ADD COLUMN IF NOT EXISTS "cartaoSus" TEXT,

-- Filiação e Contatos
ADD COLUMN IF NOT EXISTS "fatherProfession" TEXT,
ADD COLUMN IF NOT EXISTS "fatherPhoneResidencial" TEXT,
ADD COLUMN IF NOT EXISTS "fatherPhoneCelular" TEXT,
ADD COLUMN IF NOT EXISTS "fatherPhoneTrabalho" TEXT,
ADD COLUMN IF NOT EXISTS "motherProfession" TEXT,
ADD COLUMN IF NOT EXISTS "motherPhoneResidencial" TEXT,
ADD COLUMN IF NOT EXISTS "motherPhoneCelular" TEXT,
ADD COLUMN IF NOT EXISTS "motherPhoneTrabalho" TEXT,

-- Endereço Detalhado
ADD COLUMN IF NOT EXISTS "numero" TEXT,
ADD COLUMN IF NOT EXISTS "complemento" TEXT,
ADD COLUMN IF NOT EXISTS "responsibleCpf" TEXT,

-- Matrícula Detalhada
ADD COLUMN IF NOT EXISTS "serie" TEXT,
ADD COLUMN IF NOT EXISTS "turno" TEXT,
ADD COLUMN IF NOT EXISTS "exercicio" TEXT,
ADD COLUMN IF NOT EXISTS "motorista" TEXT,

-- Necessidades Especiais (Booleanos)
ADD COLUMN IF NOT EXISTS "deficienciaAuditiva" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deficienciaVisual" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deficienciaFisica" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deficienciaIntelectual" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deficienciaAutismo" BOOLEAN DEFAULT false,

-- Recursos Prova Brasil (Booleanos)
ADD COLUMN IF NOT EXISTS "auxilioLedor" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "auxilioTranscricao" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "guiaInterprete" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "interpreteLibras" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "leituraLabial" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "provaAmpliada18" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "provaAmpliada24" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "provaBraile" BOOLEAN DEFAULT false;
