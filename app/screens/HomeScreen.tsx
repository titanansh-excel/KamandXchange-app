import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Image } from 'expo-image'
import { getListings, subscribeToListings } from '../lib/database'
import { useAuth } from '../context/AuthContext'
import type { Database } from '../types/database.types'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type Listing = Database['public']['Tables']['listings']['Row']

export default function HomeScreen() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()

  useEffect(() => {
    loadListings()

    // Subscribe to real-time updates
    const subscription = subscribeToListings((newListing) => {
      setListings(currentListings => [newListing, ...currentListings])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const loadListings = async () => {
    try {
      setLoading(true)
      const data = await getListings()
      console.log('Fetched listings:', data) // Debug log
      setListings(data || [])
    } catch (error) {
      console.error('Error loading listings:', error)
      Alert.alert('Error', 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="basket-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>Nothing to be sold right now</Text>
    </View>
  )

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => router.push(`../${item.id}` as const)}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={item.images[0]}
          style={styles.listingImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={32} color="#666" />
        </View>
      )}
      <View style={styles.listingInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/app-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOut}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <Text>Loading listings...</Text>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadListings}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    height: 50,
    justifyContent: 'center',
  },
  logo: {
    height: 45,
    width: 150,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
  },
  signOut: {
    color: 'red',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingImage: {
    width: '100%',
    height: 200,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    color: '#2E8B57',
    marginTop: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}) 