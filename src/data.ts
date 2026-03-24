import { Student, Employee, AcademicEvent, SchoolHistory } from './types';

export const SCHOOL_HISTORY: SchoolHistory[] = [
  {
    id: '1',
    studentId: '1',
    schoolName: 'Escola Municipal de Ensino Fundamental',
    academicYear: '2022',
    grade: '8º Ano',
    result: 'Aprovado',
    attendance: '95%',
    workload: '800h',
    observations: 'Ótimo desempenho acadêmico.',
    subjects: [
      { id: 'sub1', name: 'Português', grade: '8.5', absences: '2' },
      { id: 'sub2', name: 'Matemática', grade: '9.0', absences: '0' },
      { id: 'sub3', name: 'Ciências', grade: '8.0', absences: '4' }
    ]
  },
  {
    id: '2',
    studentId: '1',
    schoolName: 'Escola Municipal de Ensino Fundamental',
    academicYear: '2021',
    grade: '7º Ano',
    result: 'Aprovado',
    attendance: '92%',
    workload: '800h',
    subjects: [
      { id: 'sub4', name: 'Português', grade: '7.5', absences: '5' },
      { id: 'sub5', name: 'Matemática', grade: '8.0', absences: '2' },
      { id: 'sub6', name: 'Ciências', grade: '7.0', absences: '6' }
    ]
  }
];

export const STUDENTS: Student[] = [
  { 
    id: '1', 
    name: 'Ana Silva Santos', 
    email: 'ana.silva@email.com', 
    registration: '#2023001', 
    cpf: '123.456.789-00', 
    birthCertificate: '123456789',
    birthDate: '2010-05-15',
    color: 'Branca',
    gender: 'Feminino',
    cep: '12345-678',
    city: 'São Paulo',
    residentialZone: 'Urbana',
    street: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    locationType: 'Nenhum',
    motherName: 'Maria Silva Santos',
    fatherName: 'José dos Santos',
    uf: 'SP',
    class: '9º Ano A', 
    responsiblePhone: '(11) 98765-4321',
    entryDate: '2023-02-01',
    responsibleName: 'Maria Silva Santos',
    status: 'Ativo', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    inepId: '123456789012',
    nis: '12345678901',
    nationality: 'Brasileira',
    birthCountry: 'Brasil',
    birthState: 'SP',
    birthCity: 'São Paulo',
    hasDisability: false,
    disabilityType: '',
    schoolTransport: 'Não utiliza'
  },
  { 
    id: '2', 
    name: 'Bruno Costa Ferreira', 
    email: 'bruno.costa@email.com', 
    registration: '#2023002', 
    cpf: '234.567.890-11', 
    birthCertificate: '987654321',
    birthDate: '2008-08-20',
    color: 'Parda',
    gender: 'Masculino',
    cep: '87654-321',
    city: 'Rio de Janeiro',
    residentialZone: 'Urbana',
    street: 'Av. Brasil, 1000',
    neighborhood: 'Copacabana',
    locationType: 'Nenhum',
    motherName: 'Lucia Costa Ferreira',
    fatherName: 'Carlos Ferreira',
    uf: 'RJ',
    class: '1º Ano EM', 
    responsiblePhone: '(21) 91234-5678',
    entryDate: '2023-02-01',
    responsibleName: 'Lucia Costa Ferreira',
    status: 'Ativo', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    inepId: '987654321098',
    nis: '09876543210',
    nationality: 'Brasileira',
    birthCountry: 'Brasil',
    birthState: 'RJ',
    birthCity: 'Rio de Janeiro',
    hasDisability: true,
    disabilityType: 'TDAH',
    schoolTransport: 'Público'
  },
];

export const EMPLOYEES: Employee[] = [
  { id: '00124', name: 'Mariana Silva', role: 'Professora Titular', department: 'Matemática', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', status: 'Ativo' },
  { id: '00125', name: 'Roberto Carlos', role: 'Coordenador', department: 'Administrativo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', status: 'Ativo' },
  { id: '00128', name: 'Ana Paula', role: 'Secretária', department: 'Atendimento', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', status: 'Ativo' },
  { id: '00130', name: 'Julio Pereira', role: 'Prof. Auxiliar', department: 'História', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', status: 'Ativo' },
];

export const EVENTS: AcademicEvent[] = [
  { id: '1', title: 'Prova de Matemática', date: '2023-10-12', time: '09:00', type: 'Prova', description: 'Turmas: 9º Ano A, B e C' },
  { id: '2', title: 'Reunião de Planejamento', date: '2023-10-04', time: '14:00', type: 'Reunião', description: 'Sala dos Professores' },
  { id: '3', title: 'Nsa. Sra. Aparecida', date: '2023-10-12', type: 'Feriado', description: 'Feriado Nacional' },
  { id: '4', title: 'Simulado Enem', date: '2023-10-23', type: 'Prova' },
];
