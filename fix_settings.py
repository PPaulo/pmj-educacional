import re

file_path = r"c:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix nested buttons (often already fixed or fails to find, let's be thorough)
# Wait, step 31 says chunk 1 already applied! 
# Let's verify if chunk 1 applied. Step 31 says "The following changes were made... chunk 0 failed".
# This means chunk 1 WAS applied! 
# So we only need to fix line 393-405.

# Let's read the current content of lines 393-405 or use regex to replace it.
# To be absolutely safe, let's look for `const handleDeleteUserClick = async (userId: string, userName: string) => {`
# and replace it and its body.

pattern = r"(const handleDeleteUserClick = async \(userId: string, userName: string\) => \{\s+const confirmDelete = window\.confirm\([\s\S]+?\}\s+catch \(err: any\) \{\s+toast\.error\(err\.message\);\s+\}\s+\};)"

replacement = """const handleDeleteUserClick = (userId: string, userName: string) => {
       setUserToDelete({ id: userId, name: userName });
       setIsDeleteUserModalOpen(true);
  };

  const confirmDeleteUser = async () => {
       if (!userToDelete) return;
       setSaving(true);
       try {
           const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userToDelete.id });
           if (error) throw error;
           toast.success('Usuário excluído!');
           loadUsers();
           setIsDeleteUserModalOpen(false);
           setUserToDelete(null);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };"""

if re.search(pattern, content):
    new_content = re.sub(pattern, replacement, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement successful")
else:
    print("Pattern not found")
    # Let's try to just find confirmDeleteUser and define it or see what happened
