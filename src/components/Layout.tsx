import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative">
        {localStorage.getItem('impersonated_user') && (
           <div className="bg-amber-600 text-white p-2.5 font-bold text-center text-xs flex justify-center items-center gap-3 shadow-md z-50">
               <span>⚠️ Você está visualizando o sistema no modo Simulação de Usuário.</span>
               <button 
                  onClick={() => {
                      localStorage.removeItem('impersonated_user');
                      window.location.href = '/dashboard';
                  }} 
                  className="bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded-md font-black"
               >
                  Sair e Voltar para Admin
               </button>
           </div>
        )}
        <Outlet context={{ setIsSidebarOpen }} />
      </div>
    </div>
  );
}
