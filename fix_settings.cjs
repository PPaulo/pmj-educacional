const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(file_path)) {
    console.log("File not found: " + file_path);
    process.exit(1);
}

let content = fs.readFileSync(file_path, 'utf-8');

const search_text = "const handleDeleteUserClick = async (userId: string, userName: string) => {";
const index = content.indexOf(search_text);

if (index === -1) {
    console.log("Section not found");
    process.exit(1);
}

// Find the end of the function body.
// It matches:
/*
       try {
           const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userId });
           if (error) throw error;
           toast.success('Usuário excluído!');
           loadUsers();
       } catch (err: any) {
           toast.error(err.message);
       }
  };
*/

// Let's use Regex for the body search or replace.
// Basically, we just want to replace the current function.
// Since it's a fixed shape, let's find the next function `const handleUpdateUserRole = async`
const next_section = "const handleUpdateUserRole = async";
const next_index = content.indexOf(next_section);

if (next_index === -1) {
    console.log("Next section not found");
    process.exit(1);
}

const function_body = content.substring(index, next_index);
// We replace the Substring.

const replacement = `const handleDeleteUserClick = (userId: string, userName: string) => {
       setUserToDelete({ id: userId, name: userName });
       setIsDeleteUserModalOpen(true);
  };

  const confirmDeleteUser = async () => {
       if (!userToDelete) return;
       setSaving(true);
       try {
           const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userToDelete.id });
           if (error) throw error;
           toast.success('Usuário excluído com sucesso!');
           loadUsers();
           setIsDeleteUserModalOpen(false);
           setUserToDelete(null);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };\n\n  `;

const new_content = content.substring(0, index) + replacement + content.substring(next_index);

fs.writeFileSync(file_path, new_content, 'utf-8');
console.log("Replacement successful with Node!");
