// MyrentAbujaFrontend/src/screens/app/LandlordDB/AddPropertyScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const AddPropertyScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [leaseDurationMonths, setLeaseDurationMonths] = useState('');
  const [ownershipCertificateToken, setOwnershipCertificateToken] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // Stores { uri, type, name } for files
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

  // Placeholder for a generic header component
  const Header = ({ title, onBackPress }) => (
    <View style={styles.headerContainer}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={{ color: '#fff', fontSize: 24 }}>{'<'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  const handleImageUpload = useCallback(() => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024, // Optimized for web display
      maxHeight: 768,
      selectionLimit: 10, // Max 10 images as per backend multer config
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode, response.errorMessage);
        setError('Image picker error: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        // Add new assets to the existing list of selected images
        setSelectedImages(prevAssets => [...prevAssets, ...response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg', // Default to jpeg if type is missing
          name: asset.fileName || `photo-${Date.now()}.jpg`, // Default filename
        }))]);
      }
    });
  }, []);

  const handleRemoveImage = useCallback((index) => {
    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => {
            const newSelectedImages = [...selectedImages];
            newSelectedImages.splice(index, 1);
            setSelectedImages(newSelectedImages);
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  }, [selectedImages]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError('');

    // Basic validation
    if (!title || !description || !location || !price || !leaseDurationMonths || !ownershipCertificateToken || selectedImages.length === 0) {
      setError('Please fill all required fields and upload at least one image.');
      setLoading(false);
      return;
    }

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('LandlordLogin');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('price', price); // Send as string, backend parses to float
      formData.append('leaseDurationMonths', leaseDurationMonths); // Send as string, backend parses to int
      formData.append('ownershipCertificateToken', ownershipCertificateToken);

      // Append each selected image file to the FormData
      selectedImages.forEach((image, index) => {
        // Ensure the URI has the 'file://' prefix for Android if it's missing
        const uri = Platform.OS === 'android' && !image.uri.startsWith('file://') ? `file://${image.uri}` : image.uri;

        formData.append('images', {
          uri: uri,
          type: image.type,
          name: image.name,
        });
      });

      const response = await fetch(`${BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          // DO NOT set 'Content-Type': 'multipart/form-data'.
          // fetch API with FormData automatically sets the correct header.
        },
        body: formData, // Send FormData object directly
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || 'Property listed successfully, pending admin verification.', [
          { text: "OK", onPress: () => {
            // Clear form fields
            setTitle('');
            setDescription('');
            setLocation('');
            setPrice('');
            setLeaseDurationMonths('');
            setOwnershipCertificateToken('');
            setSelectedImages([]); // Clear selected images
            navigation.goBack(); // Navigate back
          }}
        ]);
      } else {
        setError(data.error || 'Failed to list property. Please try again.');
      }
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err.message || 'Network error. Could not add property.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('LandlordLogin');
      }
    } finally {
      setLoading(false);
    }
  }, [title, description, location, price, leaseDurationMonths, ownershipCertificateToken, selectedImages, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Add New Property" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Property Details</Text>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Property Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#888"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Property Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Location (e.g., Wuse 2, Abuja)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Price per month (e.g., 350000)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Lease Duration (months, e.g., 12)"
          value={leaseDurationMonths}
          onChangeText={setLeaseDurationMonths}
          keyboardType="numeric"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Ownership Certificate Token"
          value={ownershipCertificateToken}
          onChangeText={setOwnershipCertificateToken}
          autoCapitalize="characters"
          placeholderTextColor="#888"
        />

        <Text style={styles.sectionTitle}>Property Images</Text>
        <TouchableOpacity style={styles.uploadImageButton} onPress={handleImageUpload} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadImageButtonText}>📸 Upload Image(s)</Text>
          )}
        </TouchableOpacity>

        <View style={styles.imagePreviewContainer}>
          {selectedImages.length === 0 ? (
            <Text style={styles.noImagesText}>No images selected yet.</Text>
          ) : (
            selectedImages.map((image, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => handleRemoveImage(index)} style={styles.removeImageButton}>
                  <Text style={styles.removeImageButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading || selectedImages.length === 0} // Disable if no images or loading
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>List Property</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerContainer: {
    backgroundColor: '#28a745', // Green header for add property
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadImageButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadImageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noImagesText: {
    color: '#777',
    textAlign: 'center',
    width: '100%',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
});

export default AddPropertyScreen;
