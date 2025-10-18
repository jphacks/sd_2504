import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export const CategoryChip = ({ label, selected, onPress }: Props) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.chip,
      selected && styles.selected,
      pressed && styles.pressed,
    ]}
  >
    <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF7F50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 6,
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: '#FF7F50',
  },
  label: {
    color: '#FF7F50',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
});

