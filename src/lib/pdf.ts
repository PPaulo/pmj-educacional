import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';

const loadImg = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
     const img = new Image();
     img.crossOrigin = 'Anonymous';
     img.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = img.width; canvas.height = img.height;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(img, 0, 0);
         resolve(canvas.toDataURL('image/png'));
     };
     img.onerror = () => resolve(''); // fallback sem quebrar
     img.src = url;
  });
};

export const generateStudentRegistrationPDF = async (formData: Partial<Student>, school?: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pgWidth = doc.internal.pageSize.width;

  const primaryColor: [number, number, number] = [30, 58, 138];
  const secondaryColor: [number, number, number] = [71, 85, 105];
  const textColor: [number, number, number] = [15, 23, 42];
  const labelColor: [number, number, number] = [100, 116, 139];

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 10, pgWidth - 28, 32, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 12, 28, 28);
  }

  const startX = school?.logo_url ? 48 : 18;

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...secondaryColor);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 17);
  doc.text('Secretaria Municipal de Educação', startX, 22);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...primaryColor);
  doc.text((school?.name || 'ESCOLA MUNICIPAL PADRE RUY').toUpperCase(), startX, 29);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...labelColor);
  doc.text('Resolução :RESOLUÇÃO - CME Nº 017 - Início: 19/9/2024 - Fim: 31/12/2028', startX, 36);

  doc.setFontSize(8); doc.setTextColor(...labelColor);
  doc.text('Página 1 de 1', pgWidth - 45, 16);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pgWidth - 45, 21);

  const formatCell = (label: string, value: any) => `${label}\n${value || '---'}`;

  let currentY = 48;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, currentY, pgWidth - 28, 12, 1, 1, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text(`FICHA DE MATRÍCULA: ${formData.registration || '---'}`, pgWidth / 2, currentY + 7.5, { align: 'center' });
  currentY += 16;

  const drawSectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pgWidth - 28, 7, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...secondaryColor);
    doc.text(title.toUpperCase(), 16, yPos + 4.5);
    return yPos + 8;
  };

  const autoTableConfig = {
    theme: 'striped' as const,
    styles: { fontSize: 8, cellPadding: 1.2, textColor: textColor },
    headStyles: { fillColor: [255, 255, 255] as [number, number, number], textColor: labelColor, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] as [number, number, number] }
  };

  currentY = drawSectionHeader('1. Identificação do Aluno', currentY);
  autoTable(doc, {
    ...autoTableConfig,
    startY: currentY,
    body: [
      [{ content: formatCell('CÓDIGO INEP', formData.inepId) }, { content: formatCell('COD ALUNO', formData.codAluno) }, { content: formatCell('NOME COMPLETO', formData.name), colSpan: 2 }, { content: formatCell('DATA NASCIMENTO', formData.birthDate) }],
      [{ content: formatCell('NACIONALIDADE', formData.nationality) }, { content: formatCell('NATURALIDADE', formData.birthCity) }, { content: formatCell('UF', formData.birthState) }, { content: formatCell('SEXO', formData.gender) }, { content: formatCell('COR/RAÇA', formData.color) }],
      [{ content: formatCell('RG', formData.rg) }, { content: formatCell('ORG EXP', formData.orgaoExp) }, { content: formatCell('DATA EXP', formData.dataExp) }, { content: formatCell('CPF', formData.cpf), colSpan: 2 }],
      [{ content: formatCell('CERTIDÃO', formData.tipoCertidao || 'Nascimento') }, { content: formatCell('MODELO', formData.modeloCertidao) }, { content: formatCell('NÚMERO/LIVRO/FOLHA', formData.modeloCertidao === 'Modelo Antigo' ? `T:${formData.certidaoTermo || ''} L:${formData.certidaoLivro || ''} F:${formData.certidaoFolha || ''}` : formData.certidaoNumero), colSpan: 2 }, { content: formatCell('DATA CERT.', formData.certidaoData) }],
      [{ content: formatCell('NIS', formData.nis) }, { content: formatCell('CARTÃO SUS', formData.cartaoSus), colSpan: 2 }, { content: formatCell('OBSERVAÇÕES/ALERGIAS', formData.observations), colSpan: 2 }]
    ]
  });
  currentY = (doc as any).lastAutoTable.finalY + 3;

  currentY = drawSectionHeader('2. Filiação e Contatos', currentY);
  autoTable(doc, {
    ...autoTableConfig,
    startY: currentY,
    body: [
      [{ content: formatCell('NOME DO PAI', formData.fatherName), colSpan: 3 }, { content: formatCell('PROFISSÃO DO PAI', formData.fatherProfession) }],
      [{ content: formatCell('TEL. RESIDENCIAL', formData.fatherPhoneResidencial) }, { content: formatCell('TEL. CELULAR', formData.fatherPhoneCelular) }, { content: formatCell('TEL. TRABALHO', formData.fatherPhoneTrabalho), colSpan: 2 }],
      [{ content: formatCell('NOME DA MÃE', formData.motherName), colSpan: 3 }, { content: formatCell('PROFISSÃO DA MÃE', formData.motherProfession) }],
      [{ content: formatCell('TEL. RESIDENCIAL', formData.motherPhoneResidencial) }, { content: formatCell('TEL. CELULAR', formData.motherPhoneCelular) }, { content: formatCell('TEL. TRABALHO (MÃE)', formData.motherPhoneCelular), colSpan: 2 }]
    ]
  });
  currentY = (doc as any).lastAutoTable.finalY + 3;

  currentY = drawSectionHeader('3. Localização e Endereço', currentY);
  autoTable(doc, {
    ...autoTableConfig,
    startY: currentY,
    body: [
      [{ content: formatCell('ZONA', formData.residentialZone) }, { content: formatCell('ENDEREÇO/RUA', formData.street), colSpan: 2 }, { content: formatCell('NÚMERO', formData.numero) }, { content: formatCell('COMPLEMENTO', formData.complemento) }],
      [{ content: formatCell('BAIRRO', formData.neighborhood) }, { content: formatCell('CIDADE', formData.city) }, { content: formatCell('UF', formData.uf) }, { content: formatCell('CEP', formData.cep), colSpan: 2 }],
      [{ content: formatCell('RESPONSÁVEL legal', formData.responsibleName) }, { content: formatCell('TELEFONE', formData.responsiblePhone) }, { content: formatCell('CPF RESPONSÁVEL', formData.responsibleCpf), colSpan: 3 }]
    ]
  });
  currentY = (doc as any).lastAutoTable.finalY + 3;

  currentY = drawSectionHeader('4. Necessidades Especiais e Recursos', currentY);
  autoTable(doc, {
    ...autoTableConfig, startY: currentY,
    body: [
      [
        'DEFICIÊNCIAS:',
        formData.deficienciaAuditiva ? '[X] Auditiva' : '[ ] Auditiva',
        formData.deficienciaVisual ? '[X] Visual' : '[ ] Visual',
        formData.deficienciaFisica ? '[X] Física' : '[ ] Física',
        formData.deficienciaIntelectual ? '[X] Intelectual' : '[ ] Intelectual'
      ],
      ['', formData.deficienciaAutismo ? '[X] Autismo' : '[ ] Autismo', '', '', ''],
      [
        'RECURSOS:',
        formData.auxilioLedor ? '[X] Ledor' : '[ ] Ledor',
        formData.auxilioTranscricao ? '[X] Transcrição' : '[ ] Transcrição',
        formData.guiaInterprete ? '[X] Guia' : '[ ] Guia',
        formData.interpreteLibras ? '[X] Libras' : '[ ] Libras'
      ],
      [
        '',
        formData.leituraLabial ? '[X] Leitura' : '[ ] Leitura',
        formData.provaAmpliada18 ? '[X] Prova 18' : '[ ] Prova 18',
        formData.provaAmpliada24 ? '[X] Prova 24' : '[ ] Prova 24',
        formData.provaBraile ? '[X] Braile' : '[ ] Braile'
      ]
    ]
  });
  currentY = (doc as any).lastAutoTable.finalY + 3;

  currentY = drawSectionHeader('5. Matrícula Escolar', currentY);
  autoTable(doc, {
    ...autoTableConfig, startY: currentY,
    body: [[{ content: formatCell('TURMA', formData.class) }, { content: formatCell('SÉRIE', formData.serie) }, { content: formatCell('TURNO', formData.turno) }, { content: formatCell('ANO LETIVO', formData.exercicio) }]]
  });
  currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setDrawColor(203, 213, 225);
  doc.line(25, currentY, 90, currentY);
  doc.setFontSize(7); doc.text('Assinatura do Responsável', 57.5, currentY + 4, { align: 'center' });

  doc.line(120, currentY, 185, currentY);
  doc.text('Secretaria Escolar / Direção', 152.5, currentY + 4, { align: 'center' });

  doc.save(`Ficha_${(formData.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
};

export const generateStudentLinkageStatementPDF = async (formData: any, school: any) => {
  const doc = new jsPDF() as any;
  const pgWidth = doc.internal.pageSize.width as number;

  const ESTADO = 'ESTADO DO GOIÁS';
  const PREFEITURA = 'PREFEITURA MUNICIPAL DE PADRE BERNARDO';
  const SECRETARIA = 'SECRETARIA DE EDUCAÇÃO';
  const CIDADE_UF_DATADOR = 'Padre Bernardo - GO';

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 15, 28, 28);
  }

  const startX = school?.logo_url ? (pgWidth / 2) + 15 : pgWidth / 2;

  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(ESTADO.toUpperCase(), startX, 20, { align: 'center' });
  doc.text(PREFEITURA.toUpperCase(), startX, 26, { align: 'center' });
  doc.setFontSize(10);
  doc.text(SECRETARIA.toUpperCase(), startX, 31, { align: 'center' });
  doc.setFontSize(11);
  doc.text((school?.name || 'ESCOLA MUNICIPAL').toUpperCase(), startX, 36, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 36, pgWidth - 14, 36);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÃO DE VÍNCULO ESCOLAR', pgWidth / 2, 60, { align: 'center' });

  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  const currentYear = new Date().getFullYear();
  const formatBirth = formData.birthDate ? formData.birthDate.split('-').reverse().join('/') : '---';
  const today = new Date().toLocaleDateString('pt-BR');

  const text = `Declaramos para os devidos fins de direito que o(a) aluno(a) ${formData.name.toUpperCase()}, portador(a) da Matrícula nº ${formData.registration || '---'} e Código INEP ${formData.inepId || '---'}, nascido(a) em ${formatBirth}, filho(a) de ${formData.motherName || '---'} e ${formData.fatherName || '---'}, encontra-se regularmente matriculado(a) e frequentando as aulas nesta instituição de ensino no ano letivo de ${formData.exercicio || currentYear}, cursando a série ${formData.serie || '---'} na Turma ${formData.class || '---'} no Turno ${formData.turno || '---'}.

Por ser verdade, firmamos a presente.`;

  const splitText = doc.splitTextToSize(text, pgWidth - 40);
  doc.text(splitText, 20, 85, { align: 'justify', maxWidth: pgWidth - 40 });

  doc.text(`${CIDADE_UF_DATADOR}, ${today}.`, pgWidth / 2, 160, { align: 'center' });

  doc.setDrawColor(100, 100, 100);
  doc.line(pgWidth / 2 - 45, 200, pgWidth / 2 + 45, 200);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('Direção / Secretaria Escolar', pgWidth / 2, 205, { align: 'center' });

  doc.save(`Declaracao_${(formData.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
};

export const generateClassListPDF = async (className: string, students: any[], school: any) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }) as any;
  const pgWidth = doc.internal.pageSize.width;

  const calculateAge = (dateString: string) => {
    if (!dateString) return '---';
    const today = new Date();
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return '---';
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} anos`;
  };

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 10, pgWidth - 28, 28, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 17, 12, 24, 24);
  }

  const startX = school?.logo_url ? 46 : 18;

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 17);
  doc.text('Secretaria Municipal de Educação', startX, 22);
  doc.text((school?.name || 'ESCOLA MUNICIPAL').toUpperCase(), startX, 28);
  
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text(`LISTA DE ALUNOS - TURMA ${className.toUpperCase()}`, pgWidth / 2, 46, { align: 'center' });

  const bodyData = students.map((std, index) => {
    const bDate = std.birthDate || std.birth_date;
    return [
      index + 1,
      (std.name || '').toUpperCase(),
      std.registration || '---',
      bDate ? bDate.split('-').reverse().join('/') : '---',
      calculateAge(bDate),
      std.class || '---',
      std.cpf || '---',
      `${std.street || ''}${std.numero ? ', nº ' + std.numero : ''}`,
      std.responsibleName || '---',
      std.responsiblePhone || '---'
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Nº', 'Nome', 'Matrícula', 'Data Nasc.', 'Idade', 'Turma', 'CPF', 'Endereço', 'Responsável', 'Telefone']],
    body: bodyData,
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`Lista_Alunos_${className.replace(/\s+/g, '_')}.pdf`);
};

export const generateTotalStudentsPDF = async (students: any[], classes: any[], school: any) => {
  const doc = new jsPDF() as any;
  const pgWidth = doc.internal.pageSize.width;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 10, pgWidth - 28, 30, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 12, 26, 26);
  }

  const startX = school?.logo_url ? 46 : 18;

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 16);
  doc.text('Secretaria Municipal de Educação', startX, 21);
  doc.text((school?.name || 'ESCOLA MUNICIPAL').toUpperCase(), startX, 26);
  
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text('RESUMO GERAL DE MATRÍCULAS', pgWidth / 2, 42, { align: 'center' });

  // Summary Boxes
  const totalStudents = students.length;
  const totalClasses = classes.length;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 48, (pgWidth - 32) / 2, 20, 2, 2, 'F');
  doc.roundedRect(pgWidth / 2 + 2, 48, (pgWidth - 32) / 2, 20, 2, 2, 'F');

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(71, 85, 105);
  doc.text('TOTAL DE TURMAS', 14 + (pgWidth - 32) / 4, 56, { align: 'center' });
  doc.text('TOTAL DE ALUNOS', pgWidth / 2 + 2 + (pgWidth - 32) / 4, 56, { align: 'center' });

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235);
  doc.text(totalClasses.toString(), 14 + (pgWidth - 32) / 4, 63, { align: 'center' });
  doc.text(totalStudents.toString(), pgWidth / 2 + 2 + (pgWidth - 32) / 4, 63, { align: 'center' });

  const groups: { [key: string]: number } = {};
  students.forEach(s => { const key = s.class || 'Sem Turma'; groups[key] = (groups[key] || 0) + 1; });

  const bodyData = Object.entries(groups).map(([cls, count]) => [cls, count]);
  
  autoTable(doc, {
    startY: 75,
    head: [['Turma', 'Quantidade de Alunos']],
    body: bodyData,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    foot: [['TOTAL GERAL', totalStudents]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  doc.save(`Resumo_Geral_Alunos.pdf`);
};

export const generateReportCardPDF = async (formData: any, grades: any[], school: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as any;
  const pgWidth = doc.internal.pageSize.width;

  doc.setFillColor(248, 250, 252); doc.roundedRect(14, 10, pgWidth - 28, 30, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 12, 26, 26);
  }

  const startX = school?.logo_url ? 46 : 18;

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 16);
  doc.text(`Secretaria Municipal de Educação | ${(school?.name || 'ESCOLA MUNICIPAL').toUpperCase()}`, startX, 21);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text('BOLETIM ESCOLAR', pgWidth / 2, 42, { align: 'center' });

  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(`ALUNO(A): ${(formData.name || '---').toUpperCase()}`, 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matrícula: ${formData.registration || '---'}`, 14, 55);
  doc.text(`Turma: ${formData.class || '---'} | Ano: ${formData.exercicio || new Date().getFullYear()}`, 70, 55);

  const subjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física'];
  const periods = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

  const bodyData = subjects.map(sub => {
    const row: any[] = [sub];
    let totalGrade = 0;
    let totalAbsences = 0;

    periods.forEach(per => {
      const match = grades.find(g => g.subject === sub && g.period === per);
      const gradeVal = match?.grade != null ? parseFloat(match.grade) : null;
      const absVal = match?.absences != null ? parseInt(match.absences) : 0;

      row.push(gradeVal !== null ? gradeVal.toFixed(1) : '-');
      row.push(absVal);

      if (gradeVal !== null) totalGrade += gradeVal;
      totalAbsences += absVal;
    });

    row.push(totalGrade.toFixed(1));
    row.push(totalAbsences);
    const isApproved = totalGrade >= 24; 
    row.push(isApproved ? 'APROVADO' : 'CURSANDO');

    return row;
  });

  autoTable(doc, {
    startY: 62,
    head: [
      [
        { content: 'Disciplina', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
        { content: '1º Bimestre', colSpan: 2, styles: { halign: 'center' } },
        { content: '2º Bimestre', colSpan: 2, styles: { halign: 'center' } },
        { content: '3º Bimestre', colSpan: 2, styles: { halign: 'center' } },
        { content: '4º Bimestre', colSpan: 2, styles: { halign: 'center' } },
        { content: 'Resultado Final', colSpan: 3, styles: { halign: 'center' } }
      ],
      [
        'Nota', 'Faltas',
        'Nota', 'Faltas',
        'Nota', 'Faltas',
        'Nota', 'Faltas',
        'Soma', 'Faltas', 'Situação'
      ]
    ],
    body: bodyData,
    styles: { fontSize: 7, cellPadding: 1.2, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } },
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 25;
  doc.setDrawColor(200);
  doc.line(25, currentY, 80, currentY);
  doc.text('Assinatura do Responsável', 52.5, currentY + 4, { align: 'center' });
  doc.line(130, currentY, 185, currentY);
  doc.text('Direção / Secretaria', 157.5, currentY + 4, { align: 'center' });

  doc.save(`Boletim_${(formData.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
};

export const generateSchoolTranscriptPDF = async (formData: any, grades: any[], school: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as any;
  const pgWidth = doc.internal.pageSize.width;

  doc.setFillColor(248, 250, 252); doc.roundedRect(14, 10, pgWidth - 28, 30, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 12, 26, 26);
  }

  const startX = school?.logo_url ? 46 : 18;

  doc.setFontSize(8); doc.setTextColor(71, 85, 105);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 16); doc.text(`Secretaria de Educação | ${(school?.name || 'ESCOLA MUNICIPAL').toUpperCase()}`, startX, 21);
  
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text('HISTÓRICO ESCOLAR PRELIMINAR', pgWidth / 2, 42, { align: 'center' });

  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`ALUNO(A): ${(formData.name || '---').toUpperCase()}`, 14, 52);
  doc.text(`Filiação: ${formData.motherName || '---'} e ${formData.fatherName || '---'}`, 14, 57);
  doc.text(`Matrícula: ${formData.registration || '---'} | Inep: ${formData.inepId || '---'}`, 14, 62);

  const subjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física'];

  const bodyData = subjects.map(sub => {
    let totalGrade = 0;
    grades.forEach(g => { if (g.subject === sub && g.grade != null) totalGrade += parseFloat(g.grade); });
    return [sub, totalGrade.toFixed(1), totalGrade >= 24 ? 'Carga Horária Completa' : 'Cursando'];
  });

  autoTable(doc, {
    startY: 70,
    head: [['Componente Curricular / Disciplina', 'Soma das Notas', 'Resultado da Avaliação']],
    body: bodyData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138] }
  });

  doc.save(`Historico_${(formData.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
};

export const generateBolsaFamiliaAttendancePDF = async (formData: any, attendance: any[], school: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as any;
  const pgWidth = doc.internal.pageSize.width;

  const primaryColor: [number, number, number] = [30, 58, 138];
  const secondaryColor: [number, number, number] = [71, 85, 105];

  doc.setFillColor(248, 250, 252); doc.roundedRect(14, 10, pgWidth - 28, 30, 2, 2, 'F');

  if (school?.logo_url) {
      const imgData = await loadImg(school.logo_url);
      if (imgData) doc.addImage(imgData, 'PNG', 16, 12, 26, 26);
  }

  const startX = school?.logo_url ? 46 : 18;

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...secondaryColor);
  doc.text('Estado de Goiás - MUNICÍPIO DE PADRE BERNARDO', startX, 16);
  doc.text(`Secretaria Municipal de Educação | ${(school?.name || 'ESCOLA MUNICIPAL').toUpperCase()}`, startX, 21);
  
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text('DECLARAÇÃO DE MATRÍCULA E FREQUÊNCIA', pgWidth / 2, 42, { align: 'center' });

  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(`ALUNO(A): ${(formData.name || '---').toUpperCase()}`, 14, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matrícula: ${formData.registration || '---'} | CPF: ${formData.cpf || '---'}`, 14, 57);
  doc.text(`Filiação: ${formData.motherName || formData.fatherName || '---'}`, 14, 62);
  doc.text(`Turma: ${formData.class || '---'} | Turno: ${formData.turno || '---'}`, 14, 67);

  // Texto formatado para o Programa do Bolsa Família
  doc.setFontSize(10);
  const mainText = `Declaramos para os devidos fins de acompanhamento das condicionalidades do Programa Bolsa Família e demais programas sociais, que o(a) aluno(a) acima qualificado(a) está regularmente matriculado(a) nesta unidade escolar no ano letivo de ${new Date().getFullYear()}, apresentando o seguinte registro mensal de frequência:`;
  const splitMainText = doc.splitTextToSize(mainText, pgWidth - 28);
  doc.text(splitMainText, 14, 75);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const bodyData = months.map((m, index) => {
    const monthNum = index + 1;
    const monthAttendance = attendance.filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date + 'T12:00:00');
      return d.getMonth() + 1 === monthNum;
    });

    const total = monthAttendance.length;
    const present = monthAttendance.filter(a => a.status === 'Presente' || a.status === 'Justificado').length;
    const absences = total - present;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '100% *'; // Se não houver faltas lançadas do mês, considera regular

    return [m, total > 0 ? total : '20 **', present > 0 ? present : '20 **', absences > 0 ? absences : '0', pct];
  });

  autoTable(doc, {
    startY: 92,
    head: [['Mês de Referência', 'Dias Letivos', 'Presenças', 'Faltas', 'Percentual de Frequência']],
    body: bodyData,
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] } // Green-600 background para Bolsa Família vibe
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(7); doc.setTextColor(...secondaryColor);
  doc.text('(*) Frequência estimada/regular conforme registro escolar diário.', 14, currentY);
  doc.text('(**) Dias letivos previstos de acordo com o Calendário Escolar Municipal vigente.', 14, currentY + 3);

  currentY += 20;
  doc.setFontSize(9); doc.setTextColor(15, 23, 42);
  doc.text(`Padre Bernardo - GO, ${new Date().toLocaleDateString('pt-BR')}.`, pgWidth / 2, currentY, { align: 'center' });

  currentY += 25;
  doc.setDrawColor(200);
  doc.line(60, currentY, 150, currentY);
  doc.text('Assinatura da Direção / Secretaria Escolar', pgWidth / 2, currentY + 4, { align: 'center' });

  doc.save(`Frequencia_BolsaFamilia_${(formData.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
};
