
import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ClientProviders } from './components/providers/ClientProviders';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { OnboardingPage } from './components/pages/OnboardingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './components/pages/DashboardPage';
import { CreateJobPage } from './components/pages/CreateJobPage';
import { CandidatesPage } from './components/pages/CandidatesPage';
import { InterviewSimulationPage } from './components/pages/InterviewSimulationPage'; // Updated import
import { checkOnboardingStatus } from './app/actions/onboarding';

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

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
      {/* Demo helper */}
      <div className="fixed bottom-4 left-4 z-50">
         <button 
           onClick={() => navigate('/interview')}
           className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-50 hover:opacity-100 transition-opacity"
         >
           Demo Interview
         </button>
      </div>
    </>
  );

  return (
    <ClientProviders>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
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
          <Route path="/dashboard" element={
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
                <Route path="jobs" element={<Navigate to="/dashboard" replace />} /> {/* Redirect for demo */}
                <Route path="settings" element={<div className="p-10 text-center opacity-50">Settings Placeholder</div>} />
              </Routes>
              
              {/* Quick Action Demo Button (Mobile) */}
              <div className="fixed bottom-8 right-8 z-50 lg:hidden">
                <button 
                  onClick={() => navigate('/interview')}
                  className="bg-[#6D28D9] text-white p-4 rounded-full shadow-xl"
                >
                  Start Interview Demo
                </button>
              </div>
            </DashboardLayout>
          } /* Note: DashboardLayout renders children (the nested Routes) */ >
          </Route>
           {/* Fix: Route path="/dashboard/*" is required for nested routes to work inside the parent element if utilizing <Outlet/> or inner <Routes> */}
           <Route path="/dashboard/*" element={
              <DashboardLayout 
                onLogout={() => navigate('/')}
                onCreateJob={() => navigate('/dashboard/jobs/new')}
              >
                <Routes>
                  <Route index element={<DashboardPage onNavigateCreateJob={() => navigate('/dashboard/jobs/new')} />} />
                  <Route path="jobs/new" element={<CreateJobPage onBack={() => navigate('/dashboard')} onSuccess={() => navigate('/dashboard')} />} />
                  <Route path="candidates" element={<CandidatesPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </DashboardLayout>
           } />

          {/* Updated Interview Route */}
          <Route path="/interview" element={
            <InterviewSimulationPage />
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ClientProviders>
  );
};
