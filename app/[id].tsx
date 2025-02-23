import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface ProductDetailsParams {
  id: string;
  title: string;
  price: string; // Changed to string
  image: string;
  user: string;
  rating: string; // Changed to string
}

export default function ProductDetails() {
  const { id, title, price, image, user, rating } = useLocalSearchParams<ProductDetailsParams>();

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>Rs. {price}</Text>
      <Text style={styles.user}>User: {user}</Text>
      <Text style={styles.rating}>Rating: {rating}*</Text>
      {/* Add more details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    marginBottom: 10,
  },
  user: {
    fontSize: 16,
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
  },
});