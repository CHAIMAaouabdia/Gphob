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
import ScenarioChoiceScreen from '@/components/ScenarioChoiceScreen';
import { buildConfig, type QuestionnaireConfig } from '@/data/gameConfig';

type View =
  | 'landing'
  | 'auth'
  | 'questionnaire'
  | 'scenario-choice'
  | 'patient-dashboard'
  | 'therapist-dashboard'
  | 'game'
  | 'vr';

const DEFAULT_CONFIG = buildConfig(['heights', 'male', '26_35', 'during', 'medium', 'sometimes', 'sometimes_avoid', 'heartbeat', 'years', 'slight', 'meditation', 'cats']);

export default function App() {
  const { session, profile, loading } = useAuth();
  const { addNotification } = useNotifications();
  const [view, setView] = useState<View>('landing');
  const [gameData, setGameData] = useState<{ sessionId: string | null; phobiaType: string; likeType: string; customPhobiaLabel?: string }>({
    sessionId: null,
    phobiaType: 'heights',
    likeType: 'cats',
  });
  const [gameConfig, setGameConfig] = useState<QuestionnaireConfig>(DEFAULT_CONFIG);

  function goToScenarioChoice(sessionId: string | null, phobiaType: string, likeType: string, answers?: string[], customPhobiaLabel?: string) {
    setGameData({ sessionId, phobiaType, likeType, customPhobiaLabel });
    if (answers) setGameConfig(buildConfig(answers));
    setView('scenario-choice');
  }

  function goToGame() {
    setView('game');
  }

  function goToVR() {
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
          onComplete={(sessionId, phobiaType, likeType, answers, customPhobiaLabel) => goToScenarioChoice(sessionId, phobiaType, likeType, answers, customPhobiaLabel)}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    if (view === 'scenario-choice') {
      return (
        <ScenarioChoiceScreen
          phobiaType={gameData.phobiaType}
          customPhobiaLabel={gameData.customPhobiaLabel}
          likeType={gameData.likeType}
          config={gameConfig}
          onChooseImagination={goToGame}
          onChooseVR={goToVR}
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
          config={gameConfig}
          customPhobiaLabel={gameData.customPhobiaLabel}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    if (view === 'vr') {
      return (
        <VRModeScreen
          phobiaType={gameData.phobiaType}
          likeType={gameData.likeType}
          config={gameConfig}
          customPhobiaLabel={gameData.customPhobiaLabel}
          onBack={() => setView('patient-dashboard')}
        />
      );
    }

    return (
      <PatientDashboard
        onStartQuestionnaire={() => setView('questionnaire')}
        onContinueGame={(sessionId, phobiaType, likeType) => {
          setGameData({ sessionId, phobiaType, likeType });
          setView('scenario-choice');
        }}
        onStartVR={(phobiaType, likeType) => {
          setGameData({ sessionId: null, phobiaType, likeType });
          goToVR();
        }}
      />
    );
  }

  if (view === 'auth') {
    return <AuthScreen onSuccess={() => setView('landing')} onBack={() => setView('landing')} />;
  }

  return (
    <LandingPage
      onStart={() => setView('auth')}
      onSignIn={() => setView('auth')}
    />
  );
}
