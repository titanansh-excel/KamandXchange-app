import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Listing {
  id: string;
  title: string;
  price: number;
  image: string;
  user: string;
  rating: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([
    {
      id: '1',
      title: 'Mathematics Textbook',
      price: 120,
      image: 'https://th.bing.com/th/id/OIP.mNsjnsccF6xfbMLFR9x8BQHaLZ?rs=1&pid=ImgDetMain',
      user: 'User231',
      rating: 4.8,
    },
    {
      id: '2',
      title: 'High-Performance Laptop',
      price: 30000,
      image: 'https://www.windowscentral.com/sites/wpcentral.com/files/styles/mediumplus_wm_brw/public/field/image/2017/07/surface-laptop-cobalt-start.jpg?itok=s3NNjzvD',
      user: 'User224',
      rating: 4.8,
    },
    {
      id: '3',
      title: 'Running Shoes',
      price: 520,
      image: 'https://th.bing.com/th/id/OIP.VOHUBzFAzu3kDh-ddnUUjQHaHa?rs=1&pid=ImgDetMain',
      user: 'User331',
      rating: 4.2,
    },
  ]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  useEffect(() => {
    const filtered = listings.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [listings, searchQuery]);

  const renderItem = ({ item }: { item: Listing }) => (
    <Pressable onPress={() => router.push({ pathname: `/${item.id}`, params: item })}>
      <View style={styles.listingCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.listingImage}
          contentFit="contain"
          transition={200}
        />
        <Text style={styles.listingTitle}>{item.title}</Text>
        <View style={styles.priceUserRatingContainer}>
          <Text style={styles.listingPrice}>Rs. {item.price.toLocaleString()}</Text>
          <Text style={styles.userRating}>
            {item.user} {item.rating}*
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      key="singleColumnList"
      data={filteredListings.length > 0 ? filteredListings : listings}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={1}
      contentContainerStyle={styles.flatListContent}
      ListHeaderComponent={() => (
        <View>
          <View style={styles.searchBar}>
            <Ionicons name="options-outline" size={24} color="#000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={24} color="#000" />
          </View>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hello [User123],</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  greeting: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'flex-start',
  },
  listingImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  priceUserRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userRating: {
    fontSize: 12,
    textAlign: 'right',
    color: 'orange',
  },
  flatListContent: {
    paddingBottom: 20,
  },
});