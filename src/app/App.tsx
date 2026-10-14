import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/ui/Toast';
import { AuthGuard } from './AuthGuard';
import { AdminLayout } from '../components/layout/AdminLayout';

// Route-level code splitting: loads heavy screens (and recharts/leaflet) on demand
const LoginScreen = React.lazy(() => import('../features/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const AdminDashboard = React.lazy(() => import('../features/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ManualKycReviewScreen = React.lazy(() => import('../features/kyc/ManualKycReviewScreen').then(m => ({ default: m.ManualKycReviewScreen })));
const VerificationQueueScreen = React.lazy(() => import('../features/kyc/VerificationQueueScreen').then(m => ({ default: m.VerificationQueueScreen })));
const KycDetailScreen = React.lazy(() => import('../features/kyc/KycDetailScreen').then(m => ({ default: m.KycDetailScreen })));
const DisputeResolutionScreen = React.lazy(() => import('../features/disputes/DisputeResolutionScreen').then(m => ({ default: m.DisputeResolutionScreen })));
const FraudAlertsScreen = React.lazy(() => import('../features/fraud-alerts/FraudAlertsScreen').then(m => ({ default: m.FraudAlertsScreen })));
const TrustScoreScreen = React.lazy(() => import('../features/trust-score/TrustScoreScreen').then(m => ({ default: m.TrustScoreScreen })));
const OrganizationAdminScreen = React.lazy(() => import('../features/organizations/OrganizationAdminScreen').then(m => ({ default: m.OrganizationAdminScreen })));
const OrganizationDetailsScreen = React.lazy(() => import('../features/organizations/OrganizationDetailsScreen').then(m => ({ default: m.OrganizationDetailsScreen })));
const ReferralTrackingScreen = React.lazy(() => import('../features/referrals/ReferralTrackingScreen').then(m => ({ default: m.ReferralTrackingScreen })));
const SupportTicketsScreen = React.lazy(() => import('../features/tickets/SupportTicketsScreen').then(m => ({ default: m.SupportTicketsScreen })));
const PostedZigsScreen = React.lazy(() => import('../features/zigs/PostedZigsScreen').then(m => ({ default: m.PostedZigsScreen })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute default staleTime
      gcTime: 300000,    // 5 minutes garbage collection time
    },
  },
});

const RouteLoaderFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
    <div className="w-8 h-8 border-3 border-[#C69432] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#8C827A] tracking-wider uppercase">Loading console...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<RouteLoaderFallback />}>
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
                <Route path="kyc/review" element={<ManualKycReviewScreen />} />
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
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
