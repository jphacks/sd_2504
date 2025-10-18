import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';

export const SplashScreen = () => {
  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={styles.title}>Co-食</Text>
        <Text style={styles.subtitle}>食のwell-beingをあなたに</Text>
        <ActivityIndicator size="large" color="#FF7F50" style={styles.spinner} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FF7F50',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  spinner: {
    marginTop: 24,
  },
});

