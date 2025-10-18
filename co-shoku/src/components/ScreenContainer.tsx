import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  backgroundColor?: string;
};

export const ScreenContainer = ({ children, backgroundColor = '#FFF6F0' }: Props) => (
  <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
    <View style={styles.content}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
