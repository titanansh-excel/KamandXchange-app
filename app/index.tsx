import { Redirect } from 'expo-router'
import { useAuth } from './context/AuthContext'

export default function Index() {
  const { session } = useAuth()
  
  // Redirect to tabs for authenticated users, login for others
  return session ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />
} 