
import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';

type View = 'landing' | 'login';

export const App = () => {
  const [view, setView] = useState<View>('landing');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        {view === 'landing' && (
          <>
            <Navbar onNavigateLogin={() => setView('login')} />
            <LandingPage />
            <Footer />
          </>
        )}
        
        {view === 'login' && (
          <LoginPage onBack={() => setView('landing')} />
        )}
      </div>
    </ThemeProvider>
  );
};
