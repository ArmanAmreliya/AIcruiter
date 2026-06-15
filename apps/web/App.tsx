
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ClientProviders } from './components/providers/ClientProviders';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { checkOnboardingStatus } from './app/actions/onboarding';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { supabase } from './lib/supabase';
import { PageLoader } from './components/ui/PageLoader';

// Lazy loaded components for code splitting (Performance)
const LandingPage = lazy(() => import('./components/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./components/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./components/pages/SignupPage').then(module => ({ default: module.SignupPage })));
const OnboardingPage = lazy(() => import('./components/pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const DashboardPage = lazy(() => import('./components/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const CreateJobPage = lazy(() => import('./components/pages/CreateJobPage').then(module => ({ default: module.CreateJobPage })));
const CandidatesPage = lazy(() => import('./components/pages/CandidatesPage').then(module => ({ default: module.CandidatesPage })));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const InterviewSimulationPage = lazy(() => import('./components/interview/InterviewSimulationPage').then(module => ({ default: module.InterviewSimulationPage })));
const InterviewsListPage = lazy(() => import('./components/pages/InterviewsListPage').then(module => ({ default: module.InterviewsListPage })));
const InterviewLobby = lazy(() => import('./components/interview/InterviewLobby').then(module => ({ default: module.InterviewLobby })));
const InterviewRoom = lazy(() => import('./components/interview/InterviewRoom').then(module => ({ default: module.InterviewRoom })));
const ThankYouPage = lazy(() => import('./components/interview/ThankYouPage').then(module => ({ default: module.ThankYouPage })));

// Loading Fallback moved to components/ui/PageLoader.tsx

export const App = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {
    // Listen for auth changes (e.g., after Google Redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Optional: Check onboarding here if needed
        navigate('/dashboard');
      }
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLoginSuccess = async (email?: string) => {
    const emailToCheck = email || 'demo@example.com';
    setCurrentUserEmail(emailToCheck);

    // Check onboarding status
    const isOnboarded = await checkOnboardingStatus(emailToCheck);

    if (isOnboarded) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  const LandingLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      <Navbar
        onNavigateLogin={() => navigate('/login')}
        onNavigateSignup={() => navigate('/signup')}
      />
      {children}
      <Footer />
    </>
  );

  return (
    <ErrorBoundary>
      <ClientProviders>
        <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <LandingLayout>
                  <LandingPage />
                </LandingLayout>
              } />

              <Route path="/login" element={
                <LoginPage
                  onBack={() => navigate('/')}
                  onNavigateSignup={() => navigate('/signup')}
                  onLoginSuccess={handleLoginSuccess}
                />
              } />

              <Route path="/signup" element={
                <SignupPage
                  onBack={() => navigate('/')}
                  onNavigateLogin={() => navigate('/login')}
                />
              } />

              <Route path="/onboarding" element={
                <OnboardingPage
                  userEmail={currentUserEmail}
                  onComplete={() => navigate('/dashboard')}
                />
              } />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard/*" element={
                <DashboardLayout
                  onLogout={() => navigate('/')}
                  onCreateJob={() => navigate('/dashboard/jobs/new')}
                >
                  <Routes>
                    <Route index element={<DashboardPage onNavigateCreateJob={() => navigate('/dashboard/jobs/new')} />} />
                    <Route path="jobs/new" element={
                      <CreateJobPage
                        onBack={() => navigate('/dashboard')}
                        onSuccess={() => navigate('/dashboard')}
                      />
                    } />
                    <Route path="candidates" element={<CandidatesPage />} />

                    {/* Updated: Recruiter View of Interviews */}
                    <Route path="interviews" element={<InterviewsListPage />} />

                    {/* Redirect 'jobs' to interviews if someone accesses it */}
                    <Route path="jobs" element={<Navigate to="/dashboard/interviews" replace />} />

                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </DashboardLayout>
              } />

              {/* Standalone Candidate Interview Routes */}
              {/* 1. Lobby (Registration) - uses :uniqueId to match component logic */}
              <Route path="/interview/:uniqueId" element={
                <InterviewLobby />
              } />

              {/* 2. Active Room - The Real Interview Room */}
              <Route path="/interview/:jobId/room" element={
                <InterviewRoom />
              } />

              {/* 3. Thank You Page */}
              <Route path="/interview/thank-you" element={
                <ThankYouPage />
              } />

              {/* Fallback for general /interview access to a demo link or redirect */}
              <Route path="/interview" element={<Navigate to="/interview/demo-mode?preview=true" />} />

              {/* Catch all - 404 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                  <p className="mb-6 text-neutral-600">The page you are looking for does not exist.</p>
                  <button onClick={() => navigate('/')} className="text-purple-600 hover:underline">Go Home</button>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </ClientProviders>
    </ErrorBoundary>
  );
};
