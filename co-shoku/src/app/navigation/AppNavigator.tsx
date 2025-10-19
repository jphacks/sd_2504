import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { CategorySelectionScreen } from '../../screens/CategorySelectionScreen';
import { DiningRoomScreen } from '../../screens/DiningRoomScreen';
import { HomeScreen } from '../../screens/HomeScreen';
import { LoginScreen } from '../../screens/LoginScreen';
import { MyPageScreen } from '../../screens/MyPageScreen';
import { PostCaptureScreen } from '../../screens/PostCaptureScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { ReportScreen } from '../../screens/ReportScreen';
import { SplashScreen } from '../../screens/SplashScreen';
import { TimelineScreen } from '../../screens/TimelineScreen';
import { TutorialScreen } from '../../screens/TutorialScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  MyPage: undefined;
  PostCapture: undefined;
  CategorySelection: { imageUri?: string };
  Timeline: { category: string };
  DiningRoom: undefined;
  Report: { reportedUserId?: string };
};

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FFF6F0' } }}>
    <MainStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <MainStack.Screen name="MyPage" component={MyPageScreen} options={{ title: 'マイページ' }} />
    <MainStack.Screen
      name="PostCapture"
      component={PostCaptureScreen}
      options={{ title: '写真を投稿' }}
    />
    <MainStack.Screen
      name="CategorySelection"
      component={CategorySelectionScreen}
      options={{ title: 'カテゴリを選択' }}
    />
    <MainStack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'タイムライン' }} />
    <MainStack.Screen
      name="DiningRoom"
      component={DiningRoomScreen}
      options={{ title: 'わいわい食堂' }}
    />
    <MainStack.Screen name="Report" component={ReportScreen} options={{ title: '通報' }} />
  </MainStack.Navigator>
);

const TutorialNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  );
};

const SplashNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isLoading, user, hasCompletedOnboarding } = useAppContext();

  const content = useMemo(() => {
    if (isLoading) {
      return <SplashNavigator />;
    }
    if (!user) {
      return <AuthNavigator />;
    }
    if (!hasCompletedOnboarding) {
      return <TutorialNavigator />;
    }
    return <MainNavigator />;
  }, [hasCompletedOnboarding, isLoading, user]);

  return <NavigationContainer>{content}</NavigationContainer>;
};
