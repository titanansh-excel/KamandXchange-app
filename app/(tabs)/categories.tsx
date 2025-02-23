import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { id: '1', name: 'Textbooks', icon: 'book', color: '#3b82f6' },
  { id: '2', name: 'Electronics', icon: 'laptop', color: '#10b981' },
  { id: '3', name: 'Furniture', icon: 'bed', color: '#f59e0b' },
  { id: '4', name: 'Stationery', icon: 'pencil', color: '#8b5cf6' },
  { id: '5', name: 'Lab Equipment', icon: 'flask', color: '#ef4444' },
  { id: '6', name: 'Sports', icon: 'football', color: '#06b6d4' },
  { id: '7', name: 'Clothing', icon: 'shirt', color: '#ec4899' },
  { id: '8', name: 'Services', icon: 'construct', color: '#6366f1' },
];

export default function CategoriesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <Pressable key={category.id} style={styles.categoryCard}>
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={32} color="#fff" />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});