import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export const PrimaryButton = ({ title, onPress, disabled }: Props) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      pressed && styles.pressed,
      disabled && styles.disabled,
    ]}
    disabled={disabled}
  >
    <Text style={styles.label}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF7F50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: '#FFD9C9',
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

