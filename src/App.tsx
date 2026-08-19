import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import LandingPage from '@/components/LandingPage';
import AuthScreen from '@/components/AuthScreen';
import QuestionnaireScreen from '@/components/QuestionnaireScreen';
import PatientDashboard from '@/components/PatientDashboard';
import TherapistDashboard from '@/components/TherapistDashboard';
import GameJourney from '@/components/GameJourney';
import VRModeScreen from '@/components/VRModeScreen';

type View =
  | 'landing'
  | 'auth'
  | 'questionnaire'
  | 'patient-dashboard'
  | 'therapist-dashboard'
  | 'game'
  | 'vr';

export default function App() {
  const { session, profile, loading } = useAuth();
  const { addNotification } = useNotifications();
  const [view, setView] = useState<View>('landing');
  const [gameData, setGameData] = useState<{ sessionId: string | null; phobiaType: string; likeType: string }>({
    sessionId: null,
    phobiaType: 'heights',
    likeType: 'cats',
  });

  function goToGame(sessionId: string | null, phobiaType: string, likeType: string) {
    setGameData({ sessionId, phobiaType, likeType });
    setView('game');
  }

  function goToVR(phobiaType: string, likeType: string) {
    setGameData({ sessionId: null, phobiaType, likeType });
    setView('vr');
    addNotification({
      title: 'وضع الواقع الافتراضي',
      body: 'تم اختيار وضع VR. اربط النظارات وابدأ السيناريو المخصّص.',
      type: 'info',
    });
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-sky-600 dark:text-sky-400">جارٍ التحميل...</p>
      </div>
    );
  }

  if (session && profile) {
    if (profile.role === 'therapist') {
      return <TherapistDashboard />;
    }

    if (view === 'questionnaire') {
      return (
        <QuestionnaireScreen
          onComplete={(sessionId, phobiaType, likeType) => goToGame(sessionId, phobiaType, likeType)}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    if (view === 'game') {
      return (
        <GameJourney
          sessionId={gameData.sessionId}
          phobiaType={gameData.phobiaType}
          likeType={gameData.likeType}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    if (view === 'vr') {
      return (
        <VRModeScreen
          phobiaType={gameData.phobiaType}
          likeType={gameData.likeType}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    return (
      <PatientDashboard
        onStartQuestionnaire={() => setView('questionnaire')}
        onContinueGame={(sessionId, phobiaType, likeType) => goToGame(sessionId, phobiaType, likeType)}
        onStartVR={(phobiaType, likeType) => goToVR(phobiaType, likeType)}
      />
    );
  }

  if (view === 'auth') {
    return <AuthScreen onSuccess={() => setView('landing')} />;
  }

  return (
    <LandingPage
      onStart={() => setView('auth')}
      onSignIn={() => setView('auth')}
    />
  );
}
