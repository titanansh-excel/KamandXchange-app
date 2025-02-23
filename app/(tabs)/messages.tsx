import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';

type Message = {
  id: string;
  user: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const MESSAGES: Message[] = [
  {
    id: '1',
    user: 'Rahul Kumar',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
    lastMessage: 'Is the physics textbook still available?',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    user: 'Priya Singh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    lastMessage: 'I can meet tomorrow at the library',
    time: '1h ago',
    unread: false,
  },
  {
    id: '3',
    user: 'Amit Patel',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200',
    lastMessage: 'Thanks for the calculator!',
    time: '2h ago',
    unread: false,
  },
];

export default function MessagesScreen() {
  const renderItem = ({ item }: { item: Message }) => (
    <Pressable style={styles.messageItem}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text
            style={[styles.lastMessage, item.unread && styles.unreadMessage]}
            numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MESSAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 12,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 14,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
});