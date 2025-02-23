import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMessages, subscribeToMessages, getListingById } from '../lib/database';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender_username: string;
  receiver_username: string;
  listing_title: string;
};

type Conversation = {
  partnerId: string;
  partnerUsername: string;
  listingId: string;
  listingTitle: string;
  lastMessage: Message;
};

export default function MessagesScreen() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    
    const subscription = subscribeToMessages(session?.user?.id || '', async (newMessage) => {
      // Update conversations when a new message arrives
      loadConversations();
    });

    return () => {
      subscription.unsubscribe();
    }
  }, [session?.user?.id]);

  const loadConversations = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const messages = await getMessages(session.user.id);
      
      // Convert messages to conversations
      const conversationsMap = new Map<string, Conversation>();
      
      await Promise.all(
        messages.map(async (message) => {
          const partnerId = message.sender_id === session.user.id 
            ? message.receiver_id 
            : message.sender_id;
            
          const [userResponse, listingData] = await Promise.all([
            supabase.auth.admin.getUserById(partnerId),
            getListingById(message.listing_id)
          ]);

          const conversation: Conversation = {
            partnerId,
            partnerUsername: `User-${partnerId.slice(0, 8)}`,
            listingId: message.listing_id,
            listingTitle: listingData?.title || 'Unknown Listing',
            lastMessage: {
              ...message,
              sender_username: message.sender_id === session.user.id 
                ? 'You' 
                : `User-${message.sender_id.slice(0, 8)}`,
              receiver_username: message.receiver_id === session.user.id
                ? 'You'
                : `User-${message.receiver_id.slice(0, 8)}`,
              listing_title: listingData?.title || 'Unknown Listing'
            }
          };

          const key = `${partnerId}-${message.listing_id}`;
          if (!conversationsMap.has(key)) {
            conversationsMap.set(key, conversation);
          }
        })
      );

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubText}>
        Start chatting with sellers by browsing listings
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Conversation }) => {
    const messageDate = new Date(item.lastMessage.created_at);
    const timeString = messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <Pressable 
        style={styles.messageItem}
        onPress={() => {
          router.push(`/chat/${item.listingId}` as const);
        }}
      >
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.userInfo}>
              <Ionicons 
                name="person-circle" 
                size={40} 
                color="#2563eb" 
                style={styles.avatar}
              />
              <View>
                <Text style={styles.userName}>
                  {item.partnerUsername}
                </Text>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {item.listingTitle}
                </Text>
              </View>
            </View>
            <Text style={styles.messageTime}>{timeString}</Text>
          </View>
          <View style={styles.messagePreview}>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.lastMessage.content}
            </Text>
            {!item.lastMessage.read && item.lastMessage.receiver_id === session?.user?.id && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.partnerId}-${item.listingId}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={loadConversations}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageContent: {
    gap: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  listingTitle: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
});