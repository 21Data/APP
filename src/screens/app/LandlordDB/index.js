// MyrentAbujaFrontend/src/screens/app/LandlordDB/LandlordDashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PROPERTY_CARD_WIDTH = width * 0.9; // Card takes 90% of screen width

const LandlordDashboardScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Landlord'); // Placeholder for landlord's first name
  const [userFullName, setUserFullName] = useState('Landlord Name');
  const [userRole, setUserRole] = useState('Landlord');
  const [properties, setProperties] = useState([]); // State for properties owned by the landlord
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

  // Function to fetch landlord profile
  const fetchLandlordProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('LandlordLogin'); // Redirect to landlord login
        return;
      }

      let parsedUserData = null;
      if (storedUserData) {
        parsedUserData = JSON.parse(storedUserData);
        setUserName(parsedUserData.name.split(' ')[0] || 'Landlord');
        setUserFullName(parsedUserData.name || 'Landlord Name');
        setUserRole(parsedUserData.role || 'Landlord');
      }

      // API call to get fresh user profile data
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch landlord profile');
      }

      const freshUserData = await response.json();
      setUserName(freshUserData.name.split(' ')[0] || 'Landlord');
      setUserFullName(freshUserData.name || 'Landlord Name');
      setUserRole(freshUserData.role || 'Landlord');

      // After fetching profile, fetch their properties
      await fetchLandlordProperties(userToken);

    } catch (err) {
      console.error('Error fetching landlord profile:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('LandlordLogin');
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [navigation]);

  // Function to fetch properties owned by the landlord
  const fetchLandlordProperties = async (token) => {
    setLoadingProperties(true);
    try {
      // Use the general /api/properties endpoint, which now handles landlord-specific filtering
      const response = await fetch(`${BASE_URL}/properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties.');
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching landlord properties:', err);
      setError(err.message || 'Failed to load properties. Please try again.');
    } finally {
      setLoadingProperties(false);
    }
  };

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLandlordProfile();
    }, [fetchLandlordProfile])
  );

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
        <Text style={styles.propertyLocation}>📍 {item.location}</Text>
        <Text style={styles.propertyPrice}>₦{item.price.toLocaleString()}/month</Text>
        <View style={styles.propertyStatusRow}>
          <Text style={styles.propertyStatus}>
            Status: {item.isOccupied ? 'Occupied' : 'Vacant'}
          </Text>
          <Text style={styles.propertyVerification}>
            {item.verified ? 'Verified ✅' : 'Pending Verification ⏳'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>My Properties</Text>
        </View>
        <TouchableOpacity style={styles.searchIcon}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        {loadingProfile ? (
          <ActivityIndicator size="small" color="#3498db" style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={styles.errorMessage}>{error}</Text>
        ) : (
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userFullName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{userFullName}</Text>
              <Text style={styles.profileRole}>{userRole} • MyRentAbuja</Text>
            </View>
          </View>
        )}

        {/* Welcome Greeting */}
        <Text style={styles.welcomeGreeting}>Hello, {userName}!</Text>

        {/* Landlord Actions Grid */}
        <View style={styles.landlordActionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#28a745' }]} // Green for Add Property
            onPress={() => navigation.navigate('AddPropertyScreen')} // Placeholder
          >
            <Text style={styles.actionButtonText}>Add New Property 🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007bff' }]} // Blue for My Properties
            onPress={() => navigation.navigate('LandlordPropertiesScreen')} // Placeholder
          >
            <Text style={styles.actionButtonText}>View All Properties 📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6c757d' }]} // Grey for Lease Mgmt
            onPress={() => navigation.navigate('LeaseManagementScreen')} // Placeholder
          >
            <Text style={styles.actionButtonText}>Lease Management 📅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]} // Red for Messages
            onPress={() => navigation.navigate('LandlordMessagesScreen')} // Placeholder
          >
            <Text style={styles.actionButtonText}>Messages 💬</Text>
          </TouchableOpacity>
        </View>

        {/* My Properties Section */}
        <View style={styles.myPropertiesSection}>
          <Text style={styles.sectionTitle}>My Property Listings</Text>
          {loadingProperties ? (
            <ActivityIndicator size="large" color="#3498db" style={styles.loadingIndicator} />
          ) : error && !loadingProfile ? ( // Only show property specific error if profile loaded
            <Text style={styles.errorMessage}>{error}</Text>
          ) : properties.length === 0 ? (
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
              scrollEnabled={false} // Disable FlatList scrolling as it's inside a ScrollView
              contentContainerStyle={styles.propertyListContent}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation (Simplified for Landlord) */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navTextActive}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LandlordPropertiesScreen')}>
          <Text style={styles.navText}>📊 Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LandlordMessagesScreen')}>
          <Text style={styles.navText}>💬 Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Text style={styles.navText}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: 40,
  },
  menuIcon: {
    padding: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  searchIcon: {
    padding: 5,
  },
  iconText: {
    fontSize: 24,
    color: '#333',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8A2BE2', // A different purple for landlord avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileRole: {
    fontSize: 14,
    color: '#777',
  },
  welcomeGreeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  landlordActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    width: (width - 60) / 2, // 20px padding on each side, 20px in between
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  myPropertiesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  propertyListContent: {
    // No specific padding, FlatList handles it
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    width: PROPERTY_CARD_WIDTH, // Use the defined width
    alignSelf: 'center', // Center single column cards
  },
  propertyImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: 'cover',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyImagePlaceholderText: {
    color: '#777',
    fontSize: 16,
  },
  propertyInfo: {
    padding: 15,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  propertyStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  propertyStatus: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  propertyVerification: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
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
  loadingIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 12,
    color: '#007bff', // Active color for landlord nav
    marginTop: 2,
    fontWeight: 'bold',
  },
});

export default LandlordDashboardScreen;
