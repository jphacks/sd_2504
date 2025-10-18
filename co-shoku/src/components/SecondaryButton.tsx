import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export const SecondaryButton = ({ title, onPress }: Props) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    <Text style={styles.label}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF7F50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: '#FF7F50',
    fontWeight: '600',
    fontSize: 16,
  },
});

