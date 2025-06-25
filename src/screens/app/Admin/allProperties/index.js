// MyrentAbujaFrontend/src/screens/app/AdminDB/AdminPropertiesScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert, // For potential future actions like verification directly from list
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Two cards per row with 20px padding on each side

const AdminPropertiesScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
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

  // Function to fetch all properties for admin
  const fetchAllPropertiesForAdmin = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (!userToken || !userData) {
        setError('Authentication token or user data not found. Please log in as an admin.');
        navigation.replace('LandlordLogin'); // Redirect to a general login or admin-specific login
        return;
      }
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.role !== 'admin') {
        setError('Access forbidden: You are not authorized to view this page.');
        navigation.replace('Landing'); // Redirect if not admin
        return;
      }

      // Use the admin-specific endpoint
      const response = await fetch(`${BASE_URL}/properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);

    } catch (err) {
      console.error('Error fetching all properties for admin:', err);
      setError(err.message || 'Failed to load properties. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('LandlordLogin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAllPropertiesForAdmin();
    }, [fetchAllPropertiesForAdmin])
  );

  const handleSearch = () => {
    // Implement client-side search or add search parameter to API call
    // For now, re-fetch all if search query is changed (less efficient, but works)
    fetchAllPropertiesForAdmin();
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('AdminPropertyDetailsScreen', { propertyId: item.id })} // Reuse PropertyDetailsScreen
    >
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
      ) : (
        <View style={styles.propertyImagePlaceholder}>
          <Text style={styles.propertyImagePlaceholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyLocation}>📍 {item.location}</Text>
        <Text style={styles.propertyPrice}>₦{item.price.toLocaleString()}/month</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, item.isOccupied ? styles.occupied : styles.vacant]}>
            {item.isOccupied ? 'Occupied' : 'Vacant'}
          </Text>
          <Text style={[styles.statusText, item.verified ? styles.verified : styles.unverified]}>
            {item.verified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
        {item.landlord && (
            <Text style={styles.landlordInfo}>Landlord: {item.landlord.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Properties (Admin View)" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search all properties by location, title..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={{ color: '#fff', fontSize: 24 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#5D5FEF" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.propertiesSection}>
            {properties.length === 0 ? (
              <View style={styles.noPropertiesCard}>
                <Text style={styles.noPropertiesText}>No properties found in the system.</Text>
              </View>
            ) : (
              <FlatList
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
                contentContainerStyle={styles.propertyListContent}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: '#5D5FEF', // Admin theme color
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
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingRight: 10,
  },
  searchButton: {
    backgroundColor: '#5D5FEF', // Admin theme color
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  propertiesSection: {
    marginBottom: 20,
  },
  propertyListContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: CARD_WIDTH,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyImagePlaceholderText: {
    color: '#777',
    fontSize: 14,
  },
  propertyInfo: {
    padding: 10,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    color: '#fff',
  },
  occupied: {
    backgroundColor: '#e74c3c', // Red for occupied
  },
  vacant: {
    backgroundColor: '#28a745', // Green for vacant
  },
  verified: {
    backgroundColor: '#3498db', // Blue for verified
  },
  unverified: {
    backgroundColor: '#f39c12', // Orange for unverified
  },
  landlordInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  noPropertiesCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 20,
  },
  noPropertiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default AdminPropertiesScreen;
