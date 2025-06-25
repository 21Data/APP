// MyrentAbujaFrontend/src/screens/app/Properties/index.js
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
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons'; // Ensure react-native-vector-icons is installed

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Two cards per row with 20px padding on each side

// Predefined price ranges for the filter modal
const priceRanges = [
  { label: 'Any Price', min: '', max: '' },
  { label: '₦0 - 100K', min: '0', max: '100000' },
  { label: '₦100K - 250K', min: '100000', max: '250000' },
  { label: '₦250K - 500K', min: '250000', max: '500000' },
  { label: '₦500K - 1M', min: '500000', max: '1000000' },
  { label: '₦1M+', min: '1000000', max: '' },
];

// Static number options for rooms (max 5) and lease durations
const bedroomOptions = [0, 1, 2, 3, 4, 5]; // 0 for "Any" or "Studio"
const bathroomOptions = [0, 1, 2, 3, 4, 5]; // 0 for "Any"
const leaseDurationOptions = [0, 6, 12, 18, 24, 36]; // 0 for "Any"

const PropertyDashboard = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // States for filter criteria
  const [currentMinPrice, setCurrentMinPrice] = useState(''); // Stores selected minPrice for API
  const [currentMaxPrice, setCurrentMaxPrice] = useState(''); // Stores selected maxPrice for API
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0); // Index of selected price range

  // States for static number selections
  const [selectedLeaseDuration, setSelectedLeaseDuration] = useState(0); // Default to 0 for "Any"
  const [selectedBedroomCount, setSelectedBedroomCount] = useState(0); // Default to 0 for "Any"
  const [selectedBathroomCount, setSelectedBathroomCount] = useState(0); // Default to 0 for "Any"

  const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('TenantLogin'); // Redirect to login if unauthenticated
        return;
      }

      let queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('location', searchQuery);
      if (currentMinPrice) queryParams.append('minPrice', currentMinPrice);
      if (currentMaxPrice) queryParams.append('maxPrice', currentMaxPrice);

      // Only append if a specific value is selected (not '0' for "Any")
      if (selectedLeaseDuration > 0) queryParams.append('leaseDurationMonths', selectedLeaseDuration);
      if (selectedBedroomCount > 0) queryParams.append('bedroomCount', selectedBedroomCount);
      if (selectedBathroomCount > 0) queryParams.append('bathroomCount', selectedBathroomCount);


      const url = `${BASE_URL}/properties?${queryParams.toString()}`;
      console.log('PropertyDashboard: Fetching properties from:', url); // Debug log

      const response = await fetch(url, {
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
      console.error('PropertyDashboard: Error fetching properties:', err);
      setError(err.message || 'Failed to load properties. Please try again.');
      if (err.message.includes('Unauthorized')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('TenantLogin');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentMinPrice, currentMaxPrice, selectedLeaseDuration, selectedBedroomCount, selectedBathroomCount, navigation]); // Updated dependencies

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [fetchProperties])
  );

  const handleSearch = () => {
    fetchProperties();
  };

  const handlePriceRangeSelect = (index) => {
    setSelectedPriceRangeIndex(index);
    setCurrentMinPrice(priceRanges[index].min);
    setCurrentMaxPrice(priceRanges[index].max);
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
    fetchProperties();
  };

  const handleClearFilters = () => {
    setSelectedPriceRangeIndex(0); // Reset price range to 'Any Price'
    setCurrentMinPrice('');
    setCurrentMaxPrice('');
    setSelectedLeaseDuration(0); // Reset to "Any"
    setSelectedBedroomCount(0); // Reset to "Any"
    setSelectedBathroomCount(0); // Reset to "Any"
    setSearchQuery('');
    setFilterModalVisible(false);
    setTimeout(() => {
      fetchProperties();
    }, 100);
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetailsScreen', { propertyId: item.id })}
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
          <Ionicons name="location-outline" size={14} color="#555" /> {item.location}
        </Text>
        <Text style={styles.propertyPrice}>₦{item.price.toLocaleString()}/month</Text>
        {item.bedroomCount !== undefined && <Text style={styles.propertySpecs}>🛌 {item.bedroomCount} Beds</Text>}
        {item.bathroomCount !== undefined && <Text style={styles.propertySpecs}>🛁 {item.bathroomCount} Baths</Text>}
      </View>
    </TouchableOpacity>
  );

  const Header = ({ title, onBackPress }) => (
    <View style={styles.headerContainer}>
      {onBackPress && (
        <TouchableOpacity hitSlop={{top: 20, right: 20, bottom: 20, left: 20}} onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Available Properties" onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, title or description..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="options" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.propertiesSection}>
            {properties.length === 0 ? (
              <Text style={styles.noPropertiesText}>No properties found matching your criteria.</Text>
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

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Properties</Text>

            <Text style={styles.filterLabel}>Price Range:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceRangeScroll}>
              {priceRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.priceRangeButton,
                    selectedPriceRangeIndex === index && styles.priceRangeButtonActive,
                  ]}
                  onPress={() => handlePriceRangeSelect(index)}
                >
                  <Text
                    style={[
                      styles.priceRangeButtonText,
                      selectedPriceRangeIndex === index && styles.priceRangeButtonTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Lease Duration (months):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numberSelectScroll}>
              {leaseDurationOptions.map((value) => (
                <TouchableOpacity
                  key={`lease-${value}`}
                  style={[
                    styles.numberSelectButton,
                    selectedLeaseDuration === value && styles.numberSelectButtonActive,
                  ]}
                  onPress={() => setSelectedLeaseDuration(value)}
                >
                  <Text
                    style={[
                      styles.numberSelectButtonText,
                      selectedLeaseDuration === value && styles.numberSelectButtonTextActive,
                    ]}
                  >
                    {value === 0 ? 'Any' : value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Bedrooms:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numberSelectScroll}>
              {bedroomOptions.map((value) => (
                <TouchableOpacity
                  key={`bed-${value}`}
                  style={[
                    styles.numberSelectButton,
                    selectedBedroomCount === value && styles.numberSelectButtonActive,
                  ]}
                  onPress={() => setSelectedBedroomCount(value)}
                >
                  <Text
                    style={[
                      styles.numberSelectButtonText,
                      selectedBedroomCount === value && styles.numberSelectButtonTextActive,
                    ]}
                  >
                    {value === 0 ? 'Any' : value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Bathrooms:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numberSelectScroll}>
              {bathroomOptions.map((value) => (
                <TouchableOpacity
                  key={`bath-${value}`}
                  style={[
                    styles.numberSelectButton,
                    selectedBathroomCount === value && styles.numberSelectButtonActive,
                  ]}
                  onPress={() => setSelectedBathroomCount(value)}
                >
                  <Text
                    style={[
                      styles.numberSelectButtonText,
                      selectedBathroomCount === value && styles.numberSelectButtonTextActive,
                    ]}
                  >
                    {value === 0 ? 'Any' : value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>


            <TouchableOpacity style={styles.applyFilterButton} onPress={handleApplyFilters}>
              <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearFilterButton} onPress={handleClearFilters}>
              <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 50,
    backgroundColor: '#3498db',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10, // Added margin for consistency with cards
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
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  filterButton: {
    marginLeft: 10,
    padding: 5,
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
  },
  propertySpecs: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noPropertiesText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#777',
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
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  priceRangeScroll: {
    width: '100%',
    marginBottom: 15,
  },
  priceRangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  priceRangeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  priceRangeButtonText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  priceRangeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // New styles for number selection buttons
  numberSelectScroll: {
    width: '100%',
    marginBottom: 15,
  },
  numberSelectButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    minWidth: 50, // Ensure buttons have a minimum width
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberSelectButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  numberSelectButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  numberSelectButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalInput: { // Kept for other inputs if needed, though replaced for numbers
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  applyFilterButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearFilterButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  clearFilterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default PropertyDashboard;
