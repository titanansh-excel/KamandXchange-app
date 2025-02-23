import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { createListing, uploadImage } from '../lib/database';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: '1', name: 'Textbooks', icon: 'book' },
  { id: '2', name: 'Electronics', icon: 'laptop' },
  { id: '3', name: 'Furniture', icon: 'bed' },
  { id: '4', name: 'Stationery', icon: 'pencil' },
  { id: '5', name: 'Lab Equipment', icon: 'flask' },
  { id: '6', name: 'Sports', icon: 'football' },
  { id: '7', name: 'Clothing', icon: 'shirt' },
  { id: '8', name: 'Services', icon: 'construct' },
];

export default function SellScreen() {
  const { session } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setCategory('');
    setImages([]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setCategory(categoryName);
    setShowCategoryModal(false);
  };

  const handleSubmit = async () => {
    if (!title || !price || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to create a listing');
      return;
    }

    try {
      setLoading(true);

      let imageUrls: string[] = [];
      
      // Only attempt image upload if there are images
      if (images.length > 0) {
        try {
          imageUrls = await Promise.all(
            images.map(uri => uploadImage(uri))
          );
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          Alert.alert(
            'Warning',
            'Failed to upload some images. Do you want to continue without images?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setLoading(false);
                  return;
                },
              },
              {
                text: 'Continue',
                onPress: async () => {
                  // Continue with empty image array
                  imageUrls = [];
                }
              }
            ]
          );
          return;
        }
      }

      try {
        const newListing = await createListing({
          title,
          price: parseFloat(price),
          description,
          category,
          images: imageUrls,
          user_id: session.user.id,
          status: 'available'
        });
        
        console.log('Created listing:', newListing);
        
        resetForm();
        Alert.alert('Success', 'Listing created successfully', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/');
            }
          }
        ]);
      } catch (listingError: any) {
        console.error('Error creating listing:', listingError);
        if (listingError.message?.includes('security policy')) {
          Alert.alert('Error', 'You do not have permission to create listings. Please check your account permissions.');
        } else {
          Alert.alert('Error', 'Failed to create listing. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, index) => (
            <Image
              key={index}
              source={uri}
              style={styles.previewImage}
              contentFit="cover"
            />
          ))}
          <Pressable style={styles.addImageButton} onPress={pickImage}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.addImageText}>Add Photos</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you selling?"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price in ₹"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <Pressable
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[
              styles.categoryText,
              !category && styles.placeholderText
            ]}>
              {category || 'Select a category'}
            </Text>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </Pressable>
        </View>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <Pressable
                  onPress={() => setShowCategoryModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </Pressable>
              </View>
              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.categoryOption}
                    onPress={() => handleCategorySelect(item.name)}
                  >
                    <Ionicons name={item.icon as any} size={24} color="#666" />
                    <Text style={styles.categoryOptionText}>{item.name}</Text>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item (condition, features, etc.)"
            multiline
            numberOfLines={4}
          />
        </View>

        <Pressable 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Post Listing'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    marginTop: 8,
    color: '#666',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  categorySelector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});