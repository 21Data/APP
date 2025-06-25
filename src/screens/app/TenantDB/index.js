// MyrentAbujaFrontend/src/screens/app/TenantDB/TenantDashboardScreen.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Modal, // Import Modal for the drawable window
  Pressable, // Import Pressable for modal overlay to close on outside touch
  Animated, // Import Animated for custom animations
} from 'react-native';
import { SvgXml } from 'react-native-svg'; // For the menu icon
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../../context/AuthContext'; // Import AuthContext


// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// SVG for the menu icon (a simple hamburger icon)
const menuIconXml = `
<svg fill="#333" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
</svg>
`;

const TenantDashboardScreen = () => {
  const {signOut} = useContext(AuthContext);
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Tenant');
  const [userFullName, setUserFullName] = useState('MyRentAbuja User');
  const [userRole, setUserRole] = useState('Tenant');
  const [currentOccupiedProperty, setCurrentOccupiedProperty] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [error, setError] = useState('');
  const [showDrawer, setShowDrawer] = useState(false); // State for drawer visibility

  // Animated value for drawer position
  const slideAnim = useRef(new Animated.Value(-width * 0.3)).current; // Initial position off-screen left

  const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('TenantLogin'); // Redirect to login if no token
        return;
      }

      let parsedUserData = null;
      if (storedUserData) {
        parsedUserData = JSON.parse(storedUserData);
        setUserName(parsedUserData.name ? parsedUserData.name.split(' ')[0] : 'Tenant');
        setUserFullName(parsedUserData.name || 'MyRentAbuja User');
        setUserRole(parsedUserData.role || 'Tenant');
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
        throw new Error(errorData.error || 'Failed to fetch user profile');
      }

      const freshUserData = await response.json();
      setUserName(freshUserData.name ? freshUserData.name.split(' ')[0] : 'Tenant');
      setUserFullName(freshUserData.name || 'MyRentAbuja User');
      setUserRole(freshUserData.role || 'Tenant');

      await fetchOccupiedProperty(userToken, freshUserData.id);

    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('TenantLogin');
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [navigation]);

  // Function to fetch currently occupied property
  const fetchOccupiedProperty = async (token, userId) => {
    setLoadingProperty(true);
    try {
      // Dummy logic: If user ID is 'tenantUserId' (from Postman example), show a dummy occupied property
      if (userId === 'tenantUserId') { // Replace with actual logic to determine occupied property
        setCurrentOccupiedProperty({
          id: 'occupied1',
          title: 'My Cozy Apartment',
          location: 'Wuse 2, Abuja',
          price: 290000,
          leaseDurationMonths: 12,
          imageUrl: 'https://placehold.co/600x400/000000/FFFFFF?text=My+Apartment',
          rentExpiryDate: '2025-08-31',
        });
      } else {
        setCurrentOccupiedProperty(null); // No occupied property
      }

    } catch (err) {
      console.error('Error fetching occupied property:', err);
      setCurrentOccupiedProperty(null); // Ensure it's null on error
    } finally {
      setLoadingProperty(false);
    }
  };

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  // Effect to run drawer animation when showDrawer state changes
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: showDrawer ? 0 : -width * 0.75, // Slide in or out
        duration: 300, // Animation duration
        useNativeDriver: true, // Use native driver for performance
      }
    ).start();
  }, );//[showDrawer, slideAnim, width]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await signOut(); // Call signOut from AuthContext
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => setShowDrawer(true)}>
          <SvgXml xml={menuIconXml} width="36" height="32" />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Abuja</Text>
          <Text style={styles.iconTextSmall}>▼</Text>
        </View>
        <TouchableOpacity style={styles.searchIcon}>
          <Text style={styles.iconText}> </Text>
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

        {/* Main Navigation Buttons */}
        <View style={styles.mainButtonsGrid}>
          <TouchableOpacity
            style={[styles.gridButton, { backgroundColor: '#5D5FEF' }]}
            onPress={() => navigation.navigate('PropertyDashboard')}
          >
            <Text style={styles.gridButtonText}>Available Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, { backgroundColor: '#34D399' }]}
            onPress={() => navigation.navigate('MyLeasesScreen')}
          >
            <Text style={styles.gridButtonText}>My Leases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, { backgroundColor: '#9B59B6' }]}
            onPress={() => navigation.navigate('MessagesScreen')}
          >
            <Text style={styles.gridButtonText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, { backgroundColor: '#F39C12' }]}
            onPress={() => navigation.navigate('MaintenanceRequestsScreen')}
          >
            <Text style={styles.gridButtonText}>Maintenance Requests</Text>
          </TouchableOpacity>
        </View>

        {/* My Apartment Section */}
        <View style={styles.myApartmentSection}>
          <Text style={styles.sectionTitle}>My Apartment</Text>
          {loadingProperty ? (
            <ActivityIndicator size="large" color="#3498db" style={styles.loadingIndicator} />
          ) : currentOccupiedProperty ? (
            <View style={styles.occupiedPropertyCard}>
              <Image source={{ uri: currentOccupiedProperty.imageUrl }} style={styles.occupiedPropertyImage} />
              <View style={styles.occupiedPropertyInfo}>
                <Text style={styles.occupiedPropertyTitle}>{currentOccupiedProperty.title}</Text>
                <Text style={styles.occupiedPropertyLocation}>� {currentOccupiedProperty.location}</Text>
                <Text style={styles.occupiedPropertyPrice}>₦{currentOccupiedProperty.price.toLocaleString()}/month</Text>
                <Text style={styles.occupiedPropertyLease}>Lease: {currentOccupiedProperty.leaseDurationMonths} months</Text>
                <Text style={styles.occupiedPropertyExpiry}>Expires: {currentOccupiedProperty.rentExpiryDate}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>You are not currently occupying any property.</Text>
              <Text style={styles.placeholderSubText}>Browse available properties to find your next home!</Text>
              <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('PropertyDashboard')}>
                <Text style={styles.browseButtonText}>Browse Properties</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Property Categories/Tabs */}
        <View style={styles.categoryTabs}>
          <TouchableOpacity style={[styles.categoryTab, styles.activeTab]}>
            <Text style={styles.categoryTabTextActive}>Recommended</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>New Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>My Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>Verified Properties</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Property Card (as seen in image) */}
        <View style={styles.recommendedPropertyCard}>
          <Text style={styles.recommendedPropertyTitle}>Spacious 3-Bedroom Apartment</Text>
          <Text style={styles.recommendedPropertyLocation}>📍 Wuse 2, Abuja</Text>
          <Text style={styles.recommendedPropertyPrice}>💲 Price: ₦350,000/month</Text>
          <Text style={styles.recommendedPropertyLease}>🗓️ Lease: 12 months</Text>
        </View>

      </ScrollView>

      {/* Drawer Modal */}
      <Modal
        animationType="none" // Changed to none to control animation with Animated API
        transparent={true}
        visible={showDrawer}
        onRequestClose={() => setShowDrawer(false)} // For Android hardware back button
      >
        <Pressable style={styles.drawerOverlay} onPress={() => setShowDrawer(false)}>
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
            {/* Drawer Header with User Info */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>{userFullName.charAt(0)}</Text>
              </View>
              <Text style={styles.drawerUserName}>{userFullName}</Text>
              <Text style={styles.drawerUserRole}>{userRole}</Text>
            </View>

            {/* Drawer Navigation Buttons */}
            <TouchableOpacity style={styles.drawerButton} onPress={() => {
              setShowDrawer(false);
              // In a real app, you'd navigate to a Profile screen here
              console.log('Navigate to Profile');
            }}>
              <Text style={styles.drawerButtonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerButton} onPress={() => {
              setShowDrawer(false);
              // In a real app, you'd navigate to a Settings screen here
              navigation.replace('SettingScreen');
            }}>
              <Text style={styles.drawerButtonText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerButton} onPress={handleLogout}>
              <Text style={styles.drawerButtonText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgb(238, 238, 238)', // Light grey background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF', // White header background
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: 40, // Adjust for status bar on iOS
  },
  menuIcon: {
    padding: 5,
    marginBottom:0,
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
  iconTextSmall: {
    fontSize: 16,
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
    backgroundColor: '#A020F0', // Purple avatar background
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
    marginBottom: 5,
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
  mainButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridButton: {
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
  gridButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  myApartmentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  occupiedPropertyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  occupiedPropertyImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
    resizeMode: 'cover',
  },
  occupiedPropertyInfo: {
    flex: 1,
  },
  occupiedPropertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  occupiedPropertyLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  occupiedPropertyPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#27ae60', // Green for price
    marginBottom: 3,
  },
  occupiedPropertyLease: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  occupiedPropertyExpiry: {
    fontSize: 14,
    color: '#e74c3c', // Red for expiry date
  },
  placeholderCard: {
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
  placeholderText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5D5FEF', // Active tab indicator color
  },
  categoryTabText: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    fontSize: 14,
    color: '#5D5FEF', // Active tab text color
    fontWeight: 'bold',
  },
  recommendedPropertyCard: {
    backgroundColor: '#5D5FEF', // Blue background as per image
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  recommendedPropertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  recommendedPropertyLocation: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 5,
  },
  recommendedPropertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  recommendedPropertyLease: {
    fontSize: 15,
    color: '#fff',
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
  // Styles for the Drawer Modal
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 28, 129, 0.54)', // Semi-transparent overlay
    justifyContent: 'flex-start', // Align content to the left
    alignItems: 'flex-start', // Align content to the left
  },
  drawerContent: {
    width: width * 0.75, // 75% of screen width
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 60, // Space for status bar and some padding
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 }, // Shadow on the right side
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    // --- Added for slide-from-left animation ---
    position: 'absolute', // Necessary for translateX to work as expected
    top: 0,
    left: 0,
  },
  drawerHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A020F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerAvatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  drawerUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  drawerUserRole: {
    fontSize: 14,
    color: '#777',
  },
  drawerButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  drawerButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

export default TenantDashboardScreen;
