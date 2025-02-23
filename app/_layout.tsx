import React from 'react'
import { Stack, router } from 'expo-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { View, ActivityIndicator, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

function RootLayoutNav() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {session ? (
        <>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="[id]" 
            options={{
              headerTitle: 'Product Details',
              headerShown: true,
              headerLeft: () => (
                <Pressable
                  onPress={() => router.replace('/(tabs)/')}
                  style={{ marginLeft: 16, padding: 8 }}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </Pressable>
              ),
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="auth/login" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="auth/signup" 
            options={{ headerShown: false }} 
          />
        </>
      )}
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
