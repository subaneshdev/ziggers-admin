import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/ui/Toast';
import { AuthGuard } from './AuthGuard';
import { AdminLayout } from '../components/layout/AdminLayout';
import { LoginScreen } from '../features/auth/LoginScreen';
import { AdminDashboard } from '../features/dashboard/AdminDashboard';
import { VerificationQueueScreen } from '../features/kyc/VerificationQueueScreen';
import { KycDetailScreen } from '../features/kyc/KycDetailScreen';
import { DisputeResolutionScreen } from '../features/disputes/DisputeResolutionScreen';
import { FraudAlertsScreen } from '../features/fraud-alerts/FraudAlertsScreen';
import { TrustScoreScreen } from '../features/trust-score/TrustScoreScreen';
import { OrganizationAdminScreen } from '../features/organizations/OrganizationAdminScreen';
import { OrganizationDetailsScreen } from '../features/organizations/OrganizationDetailsScreen';
import { ReferralTrackingScreen } from '../features/referrals/ReferralTrackingScreen';
import { SupportTicketsScreen } from '../features/tickets/SupportTicketsScreen';
import { PostedZigsScreen } from '../features/zigs/PostedZigsScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected Admin Console Routes */}
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <AdminLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="zigs" element={<PostedZigsScreen />} />
              <Route path="kyc/queue" element={<VerificationQueueScreen />} />
              <Route path="kyc/:userId" element={<KycDetailScreen />} />
              <Route path="disputes" element={<DisputeResolutionScreen />} />
              <Route path="fraud-alerts" element={<FraudAlertsScreen />} />
              <Route path="trust-score" element={<TrustScoreScreen />} />
              <Route path="organizations" element={<OrganizationAdminScreen />} />
              <Route path="organizations/:orgId" element={<OrganizationDetailsScreen />} />
              <Route path="referrals" element={<ReferralTrackingScreen />} />
              <Route path="tickets" element={<SupportTicketsScreen />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
