export interface SubjectRecord {
  id: string;
  name: string;
  grade: string;
  absences: string;
}

export interface SchoolHistory {
  id: string;
  studentId: string;
  schoolName: string;
  academicYear: string;
  grade: string;
  result: 'Aprovado' | 'Reprovado' | 'Transferido' | 'Cursando';
  attendance: string;
  workload: string;
  observations?: string;
  subjects?: SubjectRecord[];
}

export interface Student {
  id: string;
  school_id?: string;
  name: string;
  email: string;
  registration: string;
  cpf: string;
  birthCertificate: string;
  birthDate: string;
  color: string;
  gender: string;
  cep: string;
  city: string;
  residentialZone: string;
  street: string;
  neighborhood: string;
  locationType: string;
  motherName: string;
  fatherName?: string;
  uf: string;
  class: string;
  responsiblePhone: string;
  entryDate: string;
  responsibleName: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  avatar?: string;
  inepId?: string;
  nis?: string;
  nationality?: string;
  birthCountry?: string;
  birthState?: string;
  birthCity?: string;
  hasDisability?: boolean;
  disabilityType?: string;
  schoolTransport?: string;
  observations?: string;

  // New fields from Ficha de Matrícula image
  codAluno?: string;
  rg?: string;
  orgaoExp?: string;
  dataExp?: string;
  tipoCertidao?: string;
  modeloCertidao?: string;
  certidaoNumero?: string;
  certidaoTermo?: string;
  certidaoLivro?: string;
  certidaoFolha?: string;
  certidaoData?: string;
  alergias?: string;
  tipoSanguineo?: string;
  cartaoSus?: string;

  // Parents details
  fatherProfession?: string;
  fatherPhoneResidencial?: string;
  fatherPhoneCelular?: string;
  fatherPhoneTrabalho?: string;
  motherProfession?: string;
  motherPhoneResidencial?: string;
  motherPhoneCelular?: string;
  motherPhoneTrabalho?: string;

  // Detailed address
  numero?: string;
  complemento?: string;
  responsibleCpf?: string;

  // Detailed Matricula
  serie?: string;
  turno?: string;
  exercicio?: string;
  motorista?: string;

  // Specific Disabilities
  deficienciaAuditiva?: boolean;
  deficienciaVisual?: boolean;
  deficienciaFisica?: boolean;
  deficienciaIntelectual?: boolean;
  deficienciaAutismo?: boolean;

  // Recursos Prova Brasil
  auxilioLedor?: boolean;
  auxilioTranscricao?: boolean;
  guiaInterprete?: boolean;
  interpreteLibras?: boolean;
  leituraLabial?: boolean;
  provaAmpliada18?: boolean;
  provaAmpliada24?: boolean;
  provaBraile?: boolean;
}

export interface Employee {
  id: string;
  school_id?: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  
  // Informações Pessoais
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  
  // Contato e Endereço
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  // Informações Profissionais
  admissionDate?: string;
  workload?: string;
  status: 'Ativo' | 'Inativo' | 'Afastado';
}

export interface AcademicEvent {
  id: string;
  school_id?: string;
  title: string;
  date: string;
  time?: string;
  type: 'Prova' | 'Feriado' | 'Reunião' | 'Extra';
  description?: string;
}

export interface AcademicClass {
  id: string;
  schoolId?: string;
  name: string;
  year: string;
  shift: 'Matutino' | 'Vespertino' | 'Noturno' | 'Integral';
  room?: string;
  teacherId?: string;
  createdAt?: string;
  
  // Novos campos ERP
  course?: string;
  grade?: string;
  capacity?: number;
  status?: 'Ativa' | 'Encerrada' | 'Trancada';
  minAttendance?: number;
  evaluationType?: 'Nota' | 'Conceito' | 'Parecer';
  startTime?: string;
  endTime?: string;
  periodType?: 'Bimestral' | 'Trimestral';
  passingGrade?: number;
  totalHours?: number;
  isMultiseriada?: boolean;
}
