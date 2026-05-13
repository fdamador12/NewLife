import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuProvider } from 'react-native-popup-menu';
import { OnboardingProvider } from '../context/OnboardingContext';
import { ToastProvider } from '../feedback/ToastContext';
import { ConfirmProvider } from '../feedback/ConfirmContext';
import { PetProvider } from '../modules/pet/context/PetContext';
import Toast from '../feedback/Toast';
import ConfirmModal from '../feedback/ConfirmModal';
import SettingsScreen from '../modules/config/screens/SettingsScreen';
import DeleteAccountScreen from '../modules/config/screens/DeleteAccountScreen';
import PrivacyPolicyScreen from '../modules/config/screens/PrivacyPolicyScreen';
import SplashScreen1 from '../modules/onboarding/screens/SplashScreen1';
import SplashScreen2 from '../modules/onboarding/screens/SplashScreen2';
import LoaderScreen from './LoaderScreen';
import OnboardingScreen from '../modules/onboarding/screens/OnboardingScreen';
import WelcomeScreen from '../modules/auth/screens/WelcomeScreen';
import LoginScreen from '../modules/auth/screens/LoginScreen';
import RegisterScreen from '../modules/auth/screens/RegisterScreen';
import StoryScreen from '../modules/auth/screens/StoryScreen';
import Step1_Apodo from '../modules/auth/screens/AdditionalData/Step1_Apodo';
import Step2_Pronombres from '../modules/auth/screens/AdditionalData/Step2_Pronombres';
import Step3_UltimoConsumo from '../modules/auth/screens/AdditionalData/Step3_UltimoConsumo';
import Step4_Motivo from '../modules/auth/screens/AdditionalData/Step4_Motivo';
import Step5_Dinero from '../modules/auth/screens/AdditionalData/Step5_Dinero';
import Step6_Telefono from '../modules/auth/screens/AdditionalData/Step6_Telefono';
import Step10_Horario from '../modules/auth/screens/AdditionalData/Step10_Horario';
import MainScreen from '../modules/home/screens/MainScreen';
import SOSScreen from '../modules/home/screens/SOSScreen';
import EmergencyContactsScreen from '../modules/home/screens/EmergencyContactsScreen';
import CrisisModeScreen from '../modules/home/screens/crisis/CrisisModeScreen';
import BreathingScreen from '../modules/home/screens/crisis/BreathingScreen';
import MotivationalPhrasesScreen from '../modules/home/screens/crisis/MotivationalPhrasesScreen';
import GuidedMeditationScreen from '../modules/home/screens/guided-audios/GuidedMeditationScreen';
import CongratulationsScreen from '../modules/auth/screens/AdditionalData/Congratulations';
import SavingsScreen from '../modules/home/screens/SavingsScreen';
import AppTourScreen from '../modules/auth/screens/AppTourScreen';
import GratitudeHistoryScreen from '../modules/progress/screens/GratitudeHistoryScreen';
import DailyCheckInScreen from '../modules/progress/screens/DailyCheckInScreen';
import CheckInSuccessScreen from '../modules/progress/screens/CheckInSuccessScreen';
import AnalysisScreen from '../modules/progress/screens/AnalysisScreen';
import PathScreen from '../modules/progress/screens/PathScreen';
import ProgressScreen from '../modules/progress/screens/ProgressScreen';
import LevelCompleteScreen from '../modules/progress/screens/levels/LevelCompleteScreen';
import { Nivel1Modulo1, Nivel1Modulo2, Nivel1Modulo3 } from '../modules/progress/screens/levels/steps/Nivel1';
import { Nivel2Modulo1, Nivel2Modulo2, Nivel2Modulo3 } from '../modules/progress/screens/levels/steps/Nivel2';
import { Nivel3Modulo1, Nivel3Modulo2, Nivel3Modulo3 } from '../modules/progress/screens/levels/steps/Nivel3';
import { Nivel4Modulo1, Nivel4Modulo2, Nivel4Modulo3 } from '../modules/progress/screens/levels/steps/Nivel4';
import { Nivel5Modulo1, Nivel5Modulo2, Nivel5Modulo3 } from '../modules/progress/screens/levels/steps/Nivel5';
import { Nivel6Modulo1, Nivel6Modulo2, Nivel6Modulo3 } from '../modules/progress/screens/levels/steps/Nivel6';
import { Nivel7Modulo1, Nivel7Modulo2, Nivel7Modulo3 } from '../modules/progress/screens/levels/steps/Nivel7';
import { Nivel8Modulo1, Nivel8Modulo2, Nivel8Modulo3 } from '../modules/progress/screens/levels/steps/Nivel8';
import { Nivel9Modulo1, Nivel9Modulo2, Nivel9Modulo3 } from '../modules/progress/screens/levels/steps/Nivel9';
import { Nivel10Modulo1, Nivel10Modulo2, Nivel10Modulo3 } from '../modules/progress/screens/levels/steps/Nivel10';
import { Nivel11Modulo1, Nivel11Modulo2, Nivel11Modulo3 } from '../modules/progress/screens/levels/steps/Nivel11';
import { Nivel12Modulo1, Nivel12Modulo2, Nivel12Modulo3 } from '../modules/progress/screens/levels/steps/Nivel12';
import DailyPhraseScreen from '../modules/motivation/screens/DailyPhraseScreen';
import MedalsScreen from '../modules/motivation/screens/MedalsScreen';
import ChallengesScreen from '../modules/motivation/screens/ChallengesScreen';
import ChallengeDetailScreen from '../modules/motivation/screens/ChallengeDetailScreen';
import CareScreen from '../modules/care/screens/CareScreen';
import ContactsScreen from '../modules/care/screens/contacts/ContactsScreen';
import GroupsScreen from '../modules/care/screens/groups/GroupsScreen';
import ContentScreen from '../modules/care/screens/content/ContentScreen';
import ArticleScreen from '../modules/care/screens/content/ArticleScreen';
import CategoryScreen from '../modules/care/screens/content/CategoryScreen';
import FavoritesScreen from '../modules/care/screens/content/FavoritesScreen';
import AgendaScreen from '../modules/care/screens/agenda/AgendaScreen';
import AddEventScreen from '../modules/care/screens/agenda/AddEventScreen';
import ZonesScreen from '../modules/care/screens/zones/ZonesScreen';
import MotivationalScreen from '../modules/care/screens/motivational/MotivationalScreen';
import LockedLevelScreen from '../modules/progress/screens/index/LockedLevelScreen';
import LevelsIndexScreen from '../modules/progress/screens/index/LevelsIndexScreen';
import SocialScreen from '../modules/social/screens/SocialScreen';
import PetScreen from '../modules/pet/screens/PetScreen';
import PetEvolutionScreen from '../modules/pet/screens/PetEvolutionScreen';
import PetInfoScreen from '../modules/pet/screens/PetInfoScreen';
import PetCollectionScreen from '../modules/pet/screens/PetCollectionScreen/index';
import VerifyEmailScreen from '../modules/auth/screens/VerifyEmailScreen';
import ForgotPasswordScreen from '../modules/auth/screens/ForgotPasswordScreen';



const Stack = createNativeStackNavigator();

type AppNavigatorProps = {
  initialRoute?: string;
};

export default function AppNavigator({ initialRoute = 'Splash1' }: AppNavigatorProps) {
  return (
    <MenuProvider>
      <OnboardingProvider>
        <ToastProvider>
          <ConfirmProvider>
            <PetProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{ headerShown: false }}
                  initialRouteName={initialRoute}
                >
                  <Stack.Screen name="Splash1" component={SplashScreen1} />
                  <Stack.Screen name="Splash2" component={SplashScreen2} />
                  <Stack.Screen name="LoaderScreen" component={LoaderScreen} />
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="Story" component={StoryScreen} />
                  <Stack.Screen name="Step1" component={Step1_Apodo} />
                  <Stack.Screen name="Step2" component={Step2_Pronombres} />
                  <Stack.Screen name="Step3" component={Step3_UltimoConsumo} />
                  <Stack.Screen name="Step4" component={Step4_Motivo} />
                  <Stack.Screen name="Step5" component={Step5_Dinero} />
                  <Stack.Screen name="Step6" component={Step6_Telefono} />
                  <Stack.Screen name="Step10" component={Step10_Horario} />
                  <Stack.Screen name="Home" component={MainScreen} />
                  <Stack.Screen name="SOS" component={SOSScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
                  <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                  <Stack.Screen name="PetScreen" component={PetScreen} />
                  <Stack.Screen name="PetEvolution" component={PetEvolutionScreen} />
                  <Stack.Screen name="PetInfo" component={PetInfoScreen} />
                  <Stack.Screen name="PetCollection" component={PetCollectionScreen} />
                  <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
                  <Stack.Screen name="CrisisMode" component={CrisisModeScreen} />
                  <Stack.Screen name="BreathingScreen" component={BreathingScreen} />
                  <Stack.Screen name="MotivationalPhrasesScreen" component={MotivationalPhrasesScreen} />
                  <Stack.Screen name="GuidedMeditationScreen" component={GuidedMeditationScreen} />
                  <Stack.Screen name="Congratulations" component={CongratulationsScreen} />
                  <Stack.Screen name="SavingsScreen" component={SavingsScreen} />
                  <Stack.Screen name="AppTour" component={AppTourScreen} />
                  <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} />
                  <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
                  <Stack.Screen name="CheckInSuccess" component={CheckInSuccessScreen} />
                  <Stack.Screen name="Analysis" component={AnalysisScreen} />
                  <Stack.Screen name="Path" component={PathScreen} />
                  <Stack.Screen name="Progress" component={ProgressScreen} />
                  <Stack.Screen name="Nivel1Modulo1" component={Nivel1Modulo1} />
                  <Stack.Screen name="Nivel1Modulo2" component={Nivel1Modulo2} />
                  <Stack.Screen name="Nivel1Modulo3" component={Nivel1Modulo3} />
                  <Stack.Screen name="LevelComplete" component={LevelCompleteScreen} />
                  <Stack.Screen name="Nivel2Modulo1" component={Nivel2Modulo1} />
                  <Stack.Screen name="Nivel2Modulo2" component={Nivel2Modulo2} />
                  <Stack.Screen name="Nivel2Modulo3" component={Nivel2Modulo3} />
                  <Stack.Screen name="Nivel3Modulo1" component={Nivel3Modulo1} />
                  <Stack.Screen name="Nivel3Modulo2" component={Nivel3Modulo2} />
                  <Stack.Screen name="Nivel3Modulo3" component={Nivel3Modulo3} />
                  <Stack.Screen name="Nivel4Modulo1" component={Nivel4Modulo1} />
                  <Stack.Screen name="Nivel4Modulo2" component={Nivel4Modulo2} />
                  <Stack.Screen name="Nivel4Modulo3" component={Nivel4Modulo3} />
                  <Stack.Screen name="Nivel5Modulo1" component={Nivel5Modulo1} />
                  <Stack.Screen name="Nivel5Modulo2" component={Nivel5Modulo2} />
                  <Stack.Screen name="Nivel5Modulo3" component={Nivel5Modulo3} />
                  <Stack.Screen name="Nivel6Modulo1" component={Nivel6Modulo1} />
                  <Stack.Screen name="Nivel6Modulo2" component={Nivel6Modulo2} />
                  <Stack.Screen name="Nivel6Modulo3" component={Nivel6Modulo3} />
                  <Stack.Screen name="Nivel7Modulo1" component={Nivel7Modulo1} />
                  <Stack.Screen name="Nivel7Modulo2" component={Nivel7Modulo2} />
                  <Stack.Screen name="Nivel7Modulo3" component={Nivel7Modulo3} />
                  <Stack.Screen name="Nivel8Modulo1" component={Nivel8Modulo1} />
                  <Stack.Screen name="Nivel8Modulo2" component={Nivel8Modulo2} />
                  <Stack.Screen name="Nivel8Modulo3" component={Nivel8Modulo3} />
                  <Stack.Screen name="Nivel9Modulo1" component={Nivel9Modulo1} />
                  <Stack.Screen name="Nivel9Modulo2" component={Nivel9Modulo2} />
                  <Stack.Screen name="Nivel9Modulo3" component={Nivel9Modulo3} />
                  <Stack.Screen name="Nivel10Modulo1" component={Nivel10Modulo1} />
                  <Stack.Screen name="Nivel10Modulo2" component={Nivel10Modulo2} />
                  <Stack.Screen name="Nivel10Modulo3" component={Nivel10Modulo3} />
                  <Stack.Screen name="Nivel11Modulo1" component={Nivel11Modulo1} />
                  <Stack.Screen name="Nivel11Modulo2" component={Nivel11Modulo2} />
                  <Stack.Screen name="Nivel11Modulo3" component={Nivel11Modulo3} />
                  <Stack.Screen name="Nivel12Modulo1" component={Nivel12Modulo1} />
                  <Stack.Screen name="Nivel12Modulo2" component={Nivel12Modulo2} />
                  <Stack.Screen name="Nivel12Modulo3" component={Nivel12Modulo3} />
                  <Stack.Screen name="DailyPhrase" component={DailyPhraseScreen} />
                  <Stack.Screen name="Medals" component={MedalsScreen} />
                  <Stack.Screen name="Challenges" component={ChallengesScreen} />
                  <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
                  <Stack.Screen name="CareContacts" component={ContactsScreen} />
                  <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
                  <Stack.Screen name="ContentScreen" component={ContentScreen} />
                  <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
                  <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
                  <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
                  <Stack.Screen name="AgendaScreen" component={AgendaScreen} />
                  <Stack.Screen name="AddEventScreen" component={AddEventScreen} />
                  <Stack.Screen name="ZonesScreen" component={ZonesScreen} />
                  <Stack.Screen name="MotivationalScreen" component={MotivationalScreen} />
                  <Stack.Screen name="LockedLevel" component={LockedLevelScreen} />
                  <Stack.Screen name="LevelsIndex" component={LevelsIndexScreen} />
                  <Stack.Screen name="Social" component={SocialScreen} />
                  <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </Stack.Navigator>
                <Toast />
                <ConfirmModal />
              </NavigationContainer>
            </PetProvider>
          </ConfirmProvider>
        </ToastProvider>
      </OnboardingProvider>
    </MenuProvider>
  );
}