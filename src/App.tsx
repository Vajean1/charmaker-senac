import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { ProfileForm } from './components/ProfileForm';
import { AvatarSelection } from './components/AvatarSelection';
import { QuizGame } from './components/QuizGame';
import { ResultScreen } from './components/ResultScreen';
import { MainMenu } from './components/MainMenu';
import { Community } from './components/Community';
import { Library } from './components/Library';
import { LocalsPE } from './components/LocalsPE';
import { Stories } from './components/Stories';
import { Support } from './components/Support';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeFemale from './pages/homeFemale';
import HomeMale from './pages/homeMale';

export type UserData = {
  name: string;
  age: number;
  avatar: string;
  email?: string;
};

export type GameStep = 'auth' | 'profile' | 'avatar' | 'quiz' | 'result' | 'menu' | 'community' | 'library' | 'locals' | 'stories' | 'support';

export default function App() {
  const [currentStep, setCurrentStep] = useState<GameStep>('auth');
  const [userData, setUserData] = useState<UserData>({ name: '', age: 0, avatar: '', email: '' });
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Monitorar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        setUserData((prev) => ({ ...prev, email: currentUser.email || '' }));
        setIsUserAuthenticated(true);

        // Buscar dados do perfil no Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const charDoc = await getDoc(doc(db, 'characters', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData((prev) => ({
              ...prev,
              name: userData.name || '',
              age: userData.age || 0,
              email: currentUser.email || '',
            }));
            
            // Se já tem personagem criado, verificar se já respondeu o quiz
            if (charDoc.exists()) {
              const charData = charDoc.data();
              setUserData((prev) => ({
                ...prev,
                avatar: `${charData.gender}-${charData.hairId}`,
              }));

              // Verificar se o usuário já respondeu o quiz
              try {
                const quizResultsRef = await getDoc(
                  doc(db, 'users', currentUser.uid)
                );
                const hasCompletedQuiz = quizResultsRef.data()?.quizStats?.lastQuizDate;

                if (hasCompletedQuiz) {
                  // Já respondeu o quiz, vai direto para o menu
                  setCurrentStep('menu');
                } else {
                  // Ainda não respondeu, vai para o quiz
                  setCurrentStep('quiz');
                }
              } catch (quizError) {
                console.error('Erro ao verificar quiz:', quizError);
                // Em caso de erro, vai para o quiz
                setCurrentStep('quiz');
              }
            } else {
              // Se tem perfil mas sem personagem, vai para seleção de avatar
              setCurrentStep('avatar');
            }
          } else {
            // Se não tem perfil, mostra o formulário
            setCurrentStep('profile');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Em caso de erro, mostra o formulário
          setCurrentStep('profile');
        }
      } else {
        setIsUserAuthenticated(false);
        setCurrentStep('auth');
        setUserId(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleAuthComplete = (userId: string) => {
    setUserId(userId);
    setCurrentStep('profile');
  };

  const handleProfileComplete = (profileData: { name: string; age: number }) => {
    setUserData((prev) => ({ ...prev, ...profileData }));
    setCurrentStep('avatar');
  };

  const handleAvatarComplete = (avatar: string) => {
    setUserData({ ...userData, avatar });
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setCurrentStep('result');
  };

  const handleResultContinue = () => {
    setCurrentStep('menu');
  };

  const handleRestart = async () => {
    await signOut(auth);
    setCurrentStep('auth');
    setUserData({ name: '', age: 0, avatar: '', email: '' });
    setScore(0);
    setUserId(null);
  };

  const navigateTo = (step: GameStep) => {
    // Bloquear tentativa de navegar para quiz se já foi respondido
    if (step === 'quiz') {
      // Verificar se o usuário já respondeu o quiz
      const userDocRef = doc(db, 'users', userId || '');
      getDoc(userDocRef).then((userDoc) => {
        const hasCompletedQuiz = userDoc.data()?.quizStats?.lastQuizDate;
        if (hasCompletedQuiz) {
          console.warn('Usuário já respondeu o quiz. Acesso bloqueado.');
          return; // Bloqueia o acesso
        } else {
          setCurrentStep(step);
        }
      }).catch((error) => {
        console.error('Erro ao verificar quiz:', error);
        setCurrentStep(step);
      });
    } else {
      setCurrentStep(step);
    }
  };

  // Keep the existing app UI as the root element for the default route
  const appMain = (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentStep === 'auth' && (
          <AuthForm onAuthComplete={handleAuthComplete} />
        )}
        {currentStep === 'profile' && userId && (
          <ProfileForm userId={userId} userEmail={userData.email || ''} onComplete={handleProfileComplete} />
        )}
        {currentStep === 'avatar' && (
          <AvatarSelection userName={userData.name} onComplete={handleAvatarComplete} />
        )}
        {currentStep === 'quiz' && (
          <QuizGame userData={userData} onComplete={handleQuizComplete} />
        )}
        {currentStep === 'result' && (
          <ResultScreen 
            userData={userData} 
            score={score} 
            totalQuestions={15}
            onRestart={handleRestart}
            onContinue={handleResultContinue}
          />
        )}
        {currentStep === 'menu' && (
          <MainMenu userData={userData} onNavigate={navigateTo} />
        )}
        {currentStep === 'community' && (
          <Community userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'library' && (
          <Library userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'locals' && (
          <LocalsPE userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'stories' && (
          <Stories userData={userData} onBack={() => navigateTo('menu')} />
        )}
        {currentStep === 'support' && (
          <Support userData={userData} onBack={() => navigateTo('menu')} />
        )}
      </div>
    </div>
  )

  return (
    <Router>
      <Routes>
        <Route path="/" element={appMain} />
        <Route
          path="/home-female"
          element={React.createElement(HomeFemale as any, { onDone: (data: { avatar?: string }) => { if (data?.avatar) setUserData(prev => ({ ...prev, avatar: data.avatar as string })); setCurrentStep('quiz'); navigateTo('quiz'); } })}
        />
        <Route
          path="/Female"
          element={React.createElement(HomeFemale as any, { onDone: (data: { avatar?: string }) => { if (data?.avatar) setUserData(prev => ({ ...prev, avatar: data.avatar as string })); setCurrentStep('quiz'); navigateTo('quiz'); } })}
        />
        <Route
          path="/home-male"
          element={React.createElement(HomeMale as any, { onDone: (data: { avatar?: string }) => { if (data?.avatar) setUserData(prev => ({ ...prev, avatar: data.avatar as string })); setCurrentStep('quiz'); navigateTo('quiz'); } })}
        />
        <Route
          path="/Male"
          element={React.createElement(HomeMale as any, { onDone: (data: { avatar?: string }) => { if (data?.avatar) setUserData(prev => ({ ...prev, avatar: data.avatar as string })); setCurrentStep('quiz'); navigateTo('quiz'); } })}
        />
      </Routes>
    </Router>
  );
}