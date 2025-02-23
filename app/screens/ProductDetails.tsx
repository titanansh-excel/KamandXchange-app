import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { getListingById, sendMessage, deleteListing } from '../lib/database';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [listing, setListing] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await getListingById(id as string);
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'Please sign in to chat with the seller');
      return;
    }

    try {
      await sendMessage({
        content: `Hi, I'm interested in your ${listing?.title}`,
        sender_id: session.user.id,
        receiver_id: listing?.user_id as string,
        listing_id: listing?.id as string
      });
      router.push('/(tabs)/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat with seller');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(listing?.id);
              router.replace('/(tabs)/');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const isOwner = session?.user?.id === listing.user_id;

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {listing.images && listing.images.length > 0 ? (
            listing.images.map((image: string, index: number) => (
              <Image
                key={index}
                source={image}
                style={styles.image}
                contentFit="cover"
              />
            ))
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={48} color="#666" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>₹{listing.price}</Text>
          <Text style={styles.category}>{listing.category}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description || 'No description provided'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={[
              styles.status,
              { color: listing.status === 'available' ? '#059669' : '#DC2626' }
            ]}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {isOwner ? (
              <Pressable 
                style={({pressed}) => [
                  styles.deleteButton,
                  pressed && {opacity: 0.8}
                ]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Delete Listing</Text>
              </Pressable>
            ) : (
              listing.status === 'available' && (
                <Pressable 
                  style={styles.chatButton}
                  onPress={handleChat}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Chat with Seller</Text>
                </Pressable>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: 400,
    height: 300,
  },
  noImageContainer: {
    width: 400,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  noImageText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 24,
  },
  chatButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 