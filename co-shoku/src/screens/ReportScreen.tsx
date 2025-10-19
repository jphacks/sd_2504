import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { REPORT_REASONS } from '../constants/reportReasons';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Report'>;

export const ReportScreen = ({ route, navigation }: Props) => {
  const { submitReport } = useAppContext();
  const [selectedReason, setSelectedReason] = useState<string>();
  const [freeText, setFreeText] = useState('');

  const handleSubmit = () => {
    submitReport({
      reportedUserId: route.params?.reportedUserId,
      reason: selectedReason ?? freeText,
    });
    navigation.goBack();
  };

  return (
    <ScreenContainer includeTopInset={false}>
      <View style={styles.container}>
        <Text style={styles.title}>通報する理由を選択してください</Text>
        {REPORT_REASONS.map((reason) => (
          <Pressable
            key={reason}
            onPress={() => setSelectedReason(reason)}
            style={[styles.reasonItem, selectedReason === reason && styles.reasonSelected]}
          >
            <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
              {reason}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.label}>その他の理由（任意）</Text>
        <TextInput
          style={styles.input}
          value={freeText}
          onChangeText={setFreeText}
          placeholder="詳細を記入してください（任意）"
          multiline
          numberOfLines={4}
        />

        <PrimaryButton title="通報を送信する" onPress={handleSubmit} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  reasonItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE1D4',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  reasonSelected: {
    borderColor: '#FF7F50',
    backgroundColor: '#FFF0E8',
  },
  reasonText: {
    color: '#555',
  },
  reasonTextSelected: {
    color: '#FF7F50',
    fontWeight: '600',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE1D4',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});
