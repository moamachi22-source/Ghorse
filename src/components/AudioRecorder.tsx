import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

interface AudioRecorderProps {
  audioUri?: string;
  onAudioChange: (uri: string | undefined) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  audioUri,
  onAudioChange,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const pulseScale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseScale.value,
  }));

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('خطا', 'دسترسی به میکروفون لازمه');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 600 }),
        -1,
        true
      );
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در شروع ضبط پیش اومد');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setIsRecording(false);

      if (uri) {
        onAudioChange(uri);
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در توقف ضبط پیش اومد');
    }
  };

  const playAudio = async () => {
    try {
      if (!audioUri) return;

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در پخش صدا پیش اومد');
    }
  };

  const deleteAudio = () => {
    Alert.alert(
      'حذف صدا',
      'آیا میخواید صدای ضبط شده رو حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
            onAudioChange(undefined);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>صدای یادآوری شخصی</Text>
      <Text style={styles.description}>
        میتونی صدای خودت یا عزیزانت رو ضبط کنی تا موقع یادآوری پخش بشه
      </Text>

      {!audioUri ? (
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Animated.View
            style={[styles.recordDot, isRecording && pulseStyle]}
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹ توقف ضبط' : '🎙 شروع ضبط'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={playAudio}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸ در حال پخش...' : '▶️ پخش صدا'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAudioButton}
            onPress={deleteAudio}
          >
            <Text style={styles.deleteAudioText}>🗑 حذف</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
    textAlign: 'right',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 20,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  recordingButton: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF6B6B',
  },
  recordDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#6C63FF',
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Vazirmatn_Bold',
  },
  deleteAudioButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAudioText: {
    fontSize: 15,
    fontFamily: 'Vazirmatn',
    color: '#FF6B6B',
  },
});
