import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { PatientsPage } from './pages/Patients';
import { DoctorsPage } from './pages/Doctors';
import { HospitalsPage } from './pages/Hospitals';
import { ConsultationsPage } from './pages/Consultations';
import { PrescriptionsPage } from './pages/Prescriptions';
import { MedicinesPage } from './pages/Medicines';
import { TestsPage } from './pages/Tests';
import { PaymentsPage } from './pages/Payments';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 4000 }} />
    </BrowserRouter>);

}