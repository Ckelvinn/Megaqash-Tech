import React, { useState, useEffect } from 'react';
import { User, TaskItem, TaskSubmission, HallOfFameEntry, PublishedSpotlight } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  isAdminLoggedIn,
  setAdminLoggedIn,
  getTasks,
  getSubmissions,
  getHallOfFame,
  getSpotlights,
  getUsers,
  syncFromServer,
} from './services/storage';
import { RegistrationPage } from './components/RegistrationPage';
import { LoginPage } from './components/LoginPage';
import { ActivationView } from './components/ActivationView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentUser, setLocalCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'register' | 'login'>('register');

  // Platform state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [spotlights, setSpotlights] = useState<PublishedSpotlight[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data and sync from server
  const refreshAllData = async () => {
    await syncFromServer();
    const user = getCurrentUser();
    setLocalCurrentUser(user);
    setIsAdminMode(isAdminLoggedIn());
    setTasks(getTasks());
    setSubmissions(getSubmissions());
    setHallOfFame(getHallOfFame());
    setSpotlights(getSpotlights());
  };

  useEffect(() => {
    refreshAllData().then(() => {
      setIsInitialized(true);
    });

    // Auto-poll server every 3 seconds so registrations from other phones/browsers appear automatically
    const interval = setInterval(() => {
      syncFromServer().then(() => {
        const user = getCurrentUser();
        setLocalCurrentUser(user);
        setIsAdminMode(isAdminLoggedIn());
        setTasks(getTasks());
        setSubmissions(getSubmissions());
        setHallOfFame(getHallOfFame());
      });
    }, 3000);

    // If there is an inviter in URL query, default to register view
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') || params.get('inviter')) {
      setAuthView('register');
    }

    return () => clearInterval(interval);
  }, []);

  const handleRegisterSuccess = (newUser: User) => {
    setLocalCurrentUser(newUser);
    refreshAllData();
  };

  const handleLoginSuccess = (user: User) => {
    setLocalCurrentUser(user);
    refreshAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocalCurrentUser(null);
    setAdminLoggedIn(false);
    setIsAdminMode(false);
  };

  const handleAdminAuth = () => {
    setIsAdminMode(true);
    refreshAllData();
  };

  const handleExitAdmin = () => {
    setAdminLoggedIn(false);
    setIsAdminMode(false);
    refreshAllData();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#eefcf2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-extrabold text-xl flex items-center justify-center animate-pulse">
            MQ
          </div>
          <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
            Loading MegaQash Technologies...
          </span>
        </div>
      </div>
    );
  }

  // 1. Admin Mode takes precedence if authenticated
  if (isAdminMode) {
    return (
      <AdminDashboard
        onExitAdmin={handleExitAdmin}
        onRefreshAll={refreshAllData}
      />
    );
  }

  // 2. If a user is logged in:
  if (currentUser) {
    // If user is not yet activated, show Activation screen with Lipa na M-Pesa Till details
    if (!currentUser.isActivated) {
      return (
        <ActivationView
          user={currentUser}
          onRefreshUser={refreshAllData}
          onLogout={handleLogout}
        />
      );
    }

    // Activated User Dashboard
    return (
      <UserDashboard
        user={currentUser}
        tasks={tasks}
        submissions={submissions}
        hallOfFame={hallOfFame}
        spotlights={spotlights}
        onRefreshData={refreshAllData}
        onLogout={handleLogout}
        onOpenAdmin={handleAdminAuth}
      />
    );
  }

  // 3. Public Authentication Pages (Registration or Login)
  if (authView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
        onAdminLogin={handleAdminAuth}
      />
    );
  }

  return (
    <RegistrationPage
      onRegisterSuccess={handleRegisterSuccess}
      onSwitchToLogin={() => setAuthView('login')}
      onAdminLogin={handleAdminAuth}
    />
  );
}
