import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Chat',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ marginLeft: 16, padding: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
} 