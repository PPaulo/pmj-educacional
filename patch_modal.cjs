const fs = require('fs');
let file = fs.readFileSync('src/pages/ConfiguracoesPage.tsx', 'utf8');

// 1. Import
file = file.replace(
  "import { Avatar } from '../components/Avatar';",
  "import { Avatar } from '../components/Avatar';\nimport { ConfirmationModal } from '../components/ConfirmationModal';"
);

// 2. Add State
file = file.replace(
  "const [isCreatingSchool, setIsCreatingSchool] = useState(false);",
  "const [isCreatingSchool, setIsCreatingSchool] = useState(false);\n  const [isDeleteSchoolModalOpen, setIsDeleteSchoolModalOpen] = useState(false);\n  const [schoolToDelete, setSchoolToDelete] = useState<{id: string, name: string} | null>(null);"
);

// 3. Update handleDeleteSchool
const oldFunc = `  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
       const confirmDelete = window.confirm(\`ATENÇÃO: Tem certeza que deseja excluir a escola "\${schoolName}"? Isso removerá a escola do sistema. Essa ação NÃO PODE SER DESFEITA.\`);
       if (!confirmDelete) return;

       const confirmDouble = window.confirm(\`Tem absoluta certeza? Clique OK para excluir "\${schoolName}" permanentemente.\`);
       if (!confirmDouble) return;

       setSaving(true);
       try {
           const { error } = await supabase.from('school_info').delete().eq('id', schoolId);
           if (error) throw error;
           toast.success('Escola excluída com sucesso!');
           loadSchoolInfo(); // atualiza a lista de escolas
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };`;

const newFunc = `  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
       setSchoolToDelete({ id: schoolId, name: schoolName });
       setIsDeleteSchoolModalOpen(true);
  };

  const confirmDeleteSchool = async () => {
       if (!schoolToDelete) return;
       setSaving(true);
       try {
           const { error } = await supabase.from('school_info').delete().eq('id', schoolToDelete.id);
           if (error) throw error;
           toast.success('Escola excluída com sucesso!');
           loadSchoolInfo(); // atualiza a lista de escolas
           setIsDeleteSchoolModalOpen(false);
           setSchoolToDelete(null);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };`;

file = file.replace(oldFunc, newFunc);

// 4. Update JSX
const jsxModal = `      <ConfirmationModal
        isOpen={isDeleteSchoolModalOpen}
        onClose={() => setIsDeleteSchoolModalOpen(false)}
        onConfirm={confirmDeleteSchool}
        title="Excluir Escola"
        description={\`ATENÇÃO: Tem certeza que deseja excluir a escola "\${schoolToDelete?.name}"? Todas as informações serão removidas do sistema. Essa ação NÃO PODE SER DESFEITA.\`}
        confirmText="Sim, Excluir Escola"
        cancelText="Cancelar"
        variant="danger"
      />
`;

file = file.replace(
  "      </div>\n    </>",
  "      </div>\n" + jsxModal + "    </>"
);

fs.writeFileSync('src/pages/ConfiguracoesPage.tsx', file);
console.log("Patched Confirmation Modal successfully");
