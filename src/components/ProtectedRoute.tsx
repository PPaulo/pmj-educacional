import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. Check for student session (Legacy/Portal do Aluno)
        const studentSession = sessionStorage.getItem('student_session');
        if (studentSession && location.pathname.startsWith('/aluno-portal')) {
          setAuthenticated(true);
          setUserRole('Aluno');
          setLoading(false);
          return;
        }

        // 2. Check for impersonation
        const impersonated = sessionStorage.getItem('impersonated_user');
        if (impersonated) {
          const data = JSON.parse(impersonated);
          setAuthenticated(true);
          setUserRole(data.role);
          setLoading(false);
          return;
        }

        // 3. Check Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setAuthenticated(true);
        setUserRole(profile?.role || null);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole) && userRole !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
