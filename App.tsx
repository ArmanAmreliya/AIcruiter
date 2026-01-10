
import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './components/pages/DashboardPage';
import { InterviewPage } from './components/pages/InterviewPage';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'interview';

export const App = () => {
  const [view, setView] = useState<View>('landing');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        {view === 'landing' && (
          <>
            <Navbar 
              onNavigateLogin={() => setView('login')} 
              onNavigateSignup={() => setView('signup')}
            />
            <LandingPage />
            {/* Temporary link to access interview page easily for demo purposes */}
            <div className="fixed bottom-4 left-4 z-50">
               <button 
                 onClick={() => setView('interview')}
                 className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-50 hover:opacity-100 transition-opacity"
               >
                 Demo Interview
               </button>
            </div>
            <Footer />
          </>
        )}
        
        {view === 'login' && (
          <LoginPage 
            onBack={() => setView('landing')} 
            onNavigateSignup={() => setView('signup')}
            onLoginSuccess={() => setView('dashboard')}
          />
        )}

        {view === 'signup' && (
          <SignupPage 
            onBack={() => setView('landing')}
            onNavigateLogin={() => setView('login')}
          />
        )}

        {view === 'dashboard' && (
          <DashboardLayout onLogout={() => setView('landing')}>
            <DashboardPage />
            {/* Link inside dashboard as well */}
            <div className="fixed bottom-8 right-8 z-50 lg:hidden">
              <button 
                onClick={() => setView('interview')}
                className="bg-[#6D28D9] text-white p-4 rounded-full shadow-xl"
              >
                Start Interview Demo
              </button>
            </div>
          </DashboardLayout>
        )}

        {view === 'interview' && (
          <InterviewPage onEndInterview={() => setView('dashboard')} />
        )}
      </div>
    </ThemeProvider>
  );
};
