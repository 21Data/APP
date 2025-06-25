// MyrentAbujaFrontend/src/screens/app/LandlordDB/LandlordPropertiesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Two cards per row with 20px padding on each side

const LandlordPropertiesScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false); // Placeholder for filters

  const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

  // Function to fetch properties from the backend
  const fetchLandlordProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('LandlordLogin'); // Redirect to login if no token
        return;
      }

      // The backend's /api/properties endpoint already filters by landlord_id
      // when a landlord token is provided.
      // We can add search parameters here if your backend's /api/properties
      // endpoint also supports general filtering for landlords.
      // For now, we'll fetch all properties for the logged-in landlord.
      let apiUrl = `${BASE_URL}/properties`;

      // If you want to enable search for landlords on their properties,
      // you might add query parameters here, assuming your backend's
      // GET /api/properties endpoint can handle them.
      // E.g., if (searchQuery) { apiUrl += `?location=${encodeURIComponent(searchQuery)}`; }

      const response = await fetch(apiUrl, {
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
      console.error('Error fetching landlord properties:', err);
      setError(err.message || 'Failed to load properties. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('LandlordLogin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]); // No dependency on searchQuery for now, but add if you implement landlord-side search

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLandlordProperties();
    }, [fetchLandlordProperties])
  );

  const handleSearch = () => {
    // This will trigger fetchLandlordProperties with the current searchQuery
    // if you implement search logic in fetchLandlordProperties
    fetchLandlordProperties();
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetailsScreen', { propertyId: item.id })} // Pass propertyId to details screen
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
        <Text style={styles.propertyLocation}>
          📍 {item.location}
        </Text>
        <Text style={styles.propertyPrice}>₦{item.price.toLocaleString()}/month</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, item.isOccupied ? styles.occupied : styles.vacant]}>
            {item.isOccupied ? 'Occupied' : 'Vacant'}
          </Text>
          <Text style={[styles.statusText, item.verified ? styles.verified : styles.unverified]}>
            {item.verified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Property Listings" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar (Optional for landlord properties) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your properties by location or title..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={{ color: '#fff', fontSize: 24 }}>🔍</Text>
          </TouchableOpacity>
          {/* You might not need a filter button here or it would be for landlord-specific filters */}
          {/* <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Text style={{ color: '#555', fontSize: 24 }}>⚙️</Text>
          </TouchableOpacity> */}
        </View>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.propertiesSection}>
            {properties.length === 0 ? (
              <View style={styles.noPropertiesCard}>
                <Text style={styles.noPropertiesText}>You haven't listed any properties yet.</Text>
                <TouchableOpacity
                  style={styles.addPropertyButton}
                  onPress={() => navigation.navigate('AddPropertyScreen')}
                >
                  <Text style={styles.addPropertyButtonText}>List Your First Property!</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2} // Display two columns
                columnWrapperStyle={styles.row} // Style for rows
                scrollEnabled={false} // Disable FlatList scrolling as it's inside a ScrollView
                contentContainerStyle={styles.propertyListContent}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal (Optional for landlord properties) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter My Properties</Text>
            {/* Add landlord-specific filter options here */}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: '#007bff', // Blue header for landlord properties
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
    backgroundColor: '#007bff',
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
    marginBottom: 5, // Added margin for status
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
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
    marginTop: 20, // Add some top margin
  },
  noPropertiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  addPropertyButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  addPropertyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  closeModalButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default LandlordPropertiesScreen;
