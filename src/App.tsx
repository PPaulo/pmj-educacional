/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';

// Lazy loading components for optimization
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })));
const HRPage = lazy(() => import('./pages/HRPage').then(m => ({ default: m.HRPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SchoolPage = lazy(() => import('./pages/SchoolPage').then(m => ({ default: m.SchoolPage })));
const TeacherPage = lazy(() => import('./pages/TeacherPage').then(m => ({ default: m.TeacherPage })));
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })));
const CoordinationPage = lazy(() => import('./pages/CoordinationPage').then(m => ({ default: m.CoordinationPage })));
const MerendaPage = lazy(() => import('./pages/MerendaPage').then(m => ({ default: m.MerendaPage })));
const StudentFormPage = lazy(() => import('./pages/StudentFormPage').then(m => ({ default: m.StudentFormPage })));
const StudentPortalPage = lazy(() => import('./pages/StudentPortalPage').then(m => ({ default: m.StudentPortalPage })));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const OccurrencesPage = lazy(() => import('./pages/OccurrencesPage').then(m => ({ default: m.OccurrencesPage })));
const PreRegistrationsPage = lazy(() => import('./pages/PreRegistrationsPage').then(m => ({ default: m.PreRegistrationsPage })));
const PreRegistrationForm = lazy(() => import('./pages/PreRegistrationForm').then(m => ({ default: m.PreRegistrationForm })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));
const ManualPage = lazy(() => import('./pages/ManualPage').then(m => ({ default: m.ManualPage })));
const SchoolInfoPage = lazy(() => import('./pages/SchoolInfoPage').then(m => ({ default: m.SchoolInfoPage })));
const FamilyCommunicationPage = lazy(() => import('./pages/FamilyCommunicationPage').then(m => ({ default: m.FamilyCommunicationPage })));
const StaffCommunicationPage = lazy(() => import('./pages/StaffCommunicationPage').then(m => ({ default: m.StaffCommunicationPage })));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-500">Carregando...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vagas" element={<PreRegistrationForm />} />
          <Route path="/manual" element={<ManualPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/professor" element={<TeacherPage />} />
            <Route path="/coordenacao" element={<CoordinationPage />} />
            <Route path="/merenda" element={<MerendaPage />} />
            <Route path="/aluno-portal" element={<StudentPortalPage />} />
            <Route path="/arquivos" element={<ArchivePage />} />
            <Route path="/ocorrencias" element={<OccurrencesPage />} />
            <Route path="/pre-matriculas" element={<PreRegistrationsPage />} />
            <Route path="/alunos" element={<StudentsPage />} />
            <Route path="/alunos/novo" element={<StudentFormPage />} />
            <Route path="/alunos/editar/:id" element={<StudentFormPage />} />
            <Route path="/rh" element={<HRPage />} />
            <Route path="/escola" element={<SchoolPage />} />
            <Route path="/comunicados" element={<AnnouncementsPage />} />
            <Route path="/familia" element={<FamilyCommunicationPage />} />
            <Route path="/comunicacao-rh" element={<StaffCommunicationPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="/escola-info" element={<SchoolInfoPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

