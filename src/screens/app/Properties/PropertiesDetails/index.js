// MyrentAbujaFrontend/src/screens/app/PropertyDetailsScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Ensure this is installed: npm i react-native-vector-icons

const PropertyDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { propertyId: initialPropertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [isImageFullScreen, setIsImageFullScreen] = useState(false); // New state for image focus mode

  const BASE_URL = 'http://172.20.10.2:5000/api';
  const { width, height } = Dimensions.get('window');

  // Custom Header Component
  const Header = ({ title, onBackPress, isFullScreenMode }) => (
    <View style={[
      styles.headerContainer,
      isFullScreenMode ? styles.headerTransparent : null, // Transparent background in full-screen mode
      isFullScreenMode ? { paddingTop: 0, paddingBottom: 0 } : null // Remove padding in full-screen mode
    ]}>
      {onBackPress && (
        <TouchableOpacity
          onPress={onBackPress}
          hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          style={[styles.backButton, isFullScreenMode ? styles.backButtonFullScreen : null]}
        >
          <Ionicons name="arrow-back" size={24} color={isFullScreenMode ? '#fff' : '#fff'} />
        </TouchableOpacity>
      )}
      {!isFullScreenMode && <Text style={styles.headerTitle}>{title}</Text>}
    </View>
  );

  // Fetch current user's ID and Role
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setCurrentUserId(parsedUserData.id);
          setCurrentUserRole(parsedUserData.role);
        }
      } catch (e) {
        console.error("Failed to load user data from AsyncStorage", e);
      }
    };
    fetchUserData();
  }, []);

  // Function to fetch property details from the backend
  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace(currentUserRole === 'landlord' ? 'LandlordLogin' : 'TenantLogin');
        return;
      }

      const response = await fetch(`${BASE_URL}/properties/${initialPropertyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch property details');
      }

      const data = await response.json();
      setProperty(data);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError(err.message || 'Failed to load property details. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('TenantLogin');
      }
    } finally {
      setLoading(false);
    }
  }, [initialPropertyId, navigation, currentUserRole]);

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPropertyDetails();
    }, [fetchPropertyDetails])
  );

  // Carousel logic: Update activeIndex on scroll
  const handleScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  }, []);

  // Render each image for the FlatList
  const renderImageItem = useCallback(({ item }) => (
    <Image source={{ uri: item }} style={isImageFullScreen ? styles.fullScreenImage : styles.carouselImage} />
  ), [isImageFullScreen]); // Rerender if full screen mode changes

  // Toggle image full screen mode
  const toggleImageFullScreen = () => {
    setIsImageFullScreen(prev => !prev);
  };

  const handleChatWithLandlord = () => {
    if (!property || !property.owner || !property.owner.id || !property.title || !property.owner.name) {
      Alert.alert('Error', 'Landlord or property information is incomplete. Cannot start chat.');
      console.error('PropertyDetailsScreen: Missing data for chat:', {
        propertyExists: !!property,
        ownerExists: !!property?.owner,
        ownerId: property?.owner?.id,
        propertyTitle: property?.title,
        ownerName: property?.owner?.name
      });
      return;
    }
    if (!currentUserId) {
      Alert.alert('Error', 'Your user ID is not available. Please log in again.');
      navigation.replace('TenantLogin');
      return;
    }
    if (currentUserId === property.owner.id) {
      Alert.alert('Info', 'You own this property. You can view your messages in the landlord dashboard.');
      navigation.navigate('LandlordMessagesScreen');
      return;
    }

    console.log('PropertyDetailsScreen: Navigating to ChatScreen with params:', {
      propertyId: property.id,
      participantId: property.owner.id,
      propertyTitle: property.title,
      participantName: property.owner.name,
      chatType: 'tenant-to-landlord',
    });

    navigation.navigate('ChatScreen', {
      propertyId: property.id,
      participantId: property.owner.id,
      propertyTitle: property.title,
      participantName: property.owner.name,
      chatType: 'tenant-to-landlord',
    });
  };

  const handleEditProperty = () => {
    Alert.alert('Edit Property', 'Implement navigation to property editing page.');
  };

  const handleChangeStatus = () => {
    Alert.alert('Change Status', 'Implement functionality to change property status (Occupied/Vacant).');
  };

  const handleVerifyProperty = useCallback(async (newVerificationStatus) => {
    setIsVerifying(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken || currentUserRole !== 'admin') {
        Alert.alert('Authorization Error', 'You must be an admin to perform this action.');
        setIsVerifying(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/admin/properties/${initialPropertyId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: newVerificationStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || `Property verification status updated to ${newVerificationStatus}.`);
        fetchPropertyDetails();
      } else {
        setError(data.error || 'Failed to update verification status.');
        Alert.alert('Error', data.error || 'Failed to update verification status.');
      }
    } catch (err) {
      console.error('Error verifying property:', err);
      setError(err.message || 'Network error. Could not update verification status.');
      Alert.alert('Error', err.message || 'Network error. Could not update verification status.');
    } finally {
      setIsVerifying(false);
    }
  }, [initialPropertyId, currentUserRole, fetchPropertyDetails]);


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Loading Property..." onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Error" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Property Not Found" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property details could not be loaded or do not exist.</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = currentUserId === property.owner?.id;
  const isAdminUser = currentUserRole === 'admin';

  return (
    <SafeAreaView style={[styles.safeArea, isImageFullScreen ? styles.fullScreenBackground : null]}>
      {/* Header is always present but its style changes */}
      <Header title={property.title} onBackPress={() => isImageFullScreen ? toggleImageFullScreen() : navigation.goBack()} isFullScreenMode={isImageFullScreen} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={isImageFullScreen ? styles.fullScreenContentContainer : null}
        showsVerticalScrollIndicator={!isImageFullScreen} // Disable scrolling in full-screen mode
        scrollEnabled={!isImageFullScreen} // Disable scrolling in full-screen mode
      >
        {/* Image Carousel */}
        {property.images && property.images.length > 0 ? (
          <TouchableOpacity
            style={[
              styles.imageCarouselContainer,
              isImageFullScreen ? styles.imageCarouselFullScreen : null
            ]}
            onPress={toggleImageFullScreen} // Toggle full screen on image press
            activeOpacity={1} // Keep full opacity on press
          >
            <FlatList
              ref={flatListRef}
              data={property.images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToAlignment="center"
              decelerationRate="fast"
            />
            {property.images.length > 1 && (
              <View style={styles.pagination}>
                {property.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeIndex ? styles.paginationDotActive : null,
                    ]}
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[
            styles.propertyImagePlaceholder,
            isImageFullScreen ? styles.imageCarouselFullScreen : null, // Apply full screen style to placeholder
          ]}>
            <Text style={styles.propertyImagePlaceholderText}>No Image Available</Text>
          </View>
        )}

        {/* Rectangle between image and details card */}
        {!isImageFullScreen && <View style={styles.spacerRectangle} />}

        {/* Property Details Card - Conditionally rendered */}
        {!isImageFullScreen && (
          <View style={styles.detailsCard}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.location}>{property.location}</Text>
            </View>
            <Text style={styles.price}>₦{property.price.toLocaleString()}/month</Text>
            <Text style={styles.description}>{property.description}</Text>

            {/* New Grid for Specs (Bedrooms, Bathrooms) */}
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Ionicons name="bed-outline" size={20} color="#555" style={styles.icon} />
                <Text style={styles.specLabel}>Bedrooms:</Text>
                <Text style={styles.specValue}>{property.bedroomCount || 'N/A'}</Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="bathtub-outline" size={20} color="#555" style={styles.icon} />
                <Text style={styles.specLabel}>Bathrooms:</Text>
                <Text style={styles.specValue}>{property.bathroomCount || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lease Duration:</Text>
              <Text style={styles.infoValue}>{property.leaseDurationMonths} months</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Occupied:</Text>
              <Text style={styles.infoValue}>{property.isOccupied ? 'Yes' : 'No'}</Text>
            </View>
            {property.rentExpiryDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rent Expiry:</Text>
                <Text style={styles.infoValue}>{property.rentExpiryDate}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verified:</Text>
              <Text style={styles.infoValue}>{property.verified ? <Ionicons name="checkmark-circle-outline" size={20} color="#28a745" /> : <Ionicons name="time-outline" size={20} color="#f39c12" />}</Text>
            </View>

            {/* Admin Verification Section */}
            {isAdminUser && (
              <View style={styles.adminVerificationSection}>
                <Text style={styles.ownerTitle}>Admin Actions</Text>
                {property.verified ? (
                  <TouchableOpacity
                    style={[styles.adminActionButton, styles.unverifyButton]}
                    onPress={() => handleVerifyProperty(false)}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.adminActionButtonText}>Unverify Property <Ionicons name="close-circle-outline" size={18} color="#fff" /></Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.adminActionButton, styles.verifyButton]}
                    onPress={() => handleVerifyProperty(true)}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.adminActionButtonText}>Verify Property <Ionicons name="checkmark-circle-outline" size={18} color="#fff" /></Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {isOwner && !isAdminUser ? (
              <View style={styles.landlordActions}>
                <Text style={styles.ownerTitle}>Your Property Actions</Text>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProperty}>
                  <Text style={styles.editButtonText}>Edit Property Details <Ionicons name="create-outline" size={18} color="#fff" /></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusChangeButton} onPress={handleChangeStatus}>
                  <Text style={styles.statusChangeButtonText}>Change Status ({property.isOccupied ? 'Occupied' : 'Vacant'}) <Ionicons name="sync-outline" size={18} color="#fff" /></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('LandlordMessagesScreen')}>
                  <Text style={styles.chatButtonText}>View Related Messages <Ionicons name="chatbubbles-outline" size={18} color="#fff" /></Text>
                </TouchableOpacity>
              </View>
            ) : (
              !isAdminUser && property.owner && (
                <View style={styles.ownerSection}>
                  <Text style={styles.ownerTitle}>Contact Landlord</Text>
                  <View style={styles.contactInfoRow}>
                    <Ionicons name="person-outline" size={18} color="#555" style={styles.icon} />
                    <Text style={styles.ownerText}>Name: {property.owner.name}</Text>
                  </View>
                  <View style={styles.contactInfoRow}>
                    <Ionicons name="mail-outline" size={18} color="#555" style={styles.icon} />
                    <Text style={styles.ownerText}>Email: {property.owner.email}</Text>
                  </View>
                  <View style={styles.contactInfoRow}>
                    <Ionicons name="call-outline" size={18} color="#555" style={styles.icon} />
                    <Text style={styles.ownerText}>Phone: {property.owner.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.chatButton} onPress={handleChatWithLandlord}>
                    <Text style={styles.chatButtonText}>Chat with Landlord <Ionicons name="chatbubbles-outline" size={18} color="#fff" /></Text>
                  </TouchableOpacity>
                </View>
              )
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
    backgroundColor: '#f0f2f5', // Default light background
  },
  fullScreenBackground: {
    backgroundColor: '#000', // Black background for full screen image
  },
  headerContainer: {
    backgroundColor: '#3498db',
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10, // Ensure header is above other content
  },
  headerTransparent: {
    backgroundColor: 'transparent', // Transparent header in full-screen mode
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    paddingVertical: 10, // Adjusted padding
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowOpacity: 0, // No shadow in full-screen mode
    elevation: 0,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
    padding: 5,
  },
  backButtonFullScreen: {
    top: 20, // Adjust position for full-screen mode
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background for better visibility
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  fullScreenContentContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center image vertically
    alignItems: 'center',     // Center image horizontally
    paddingBottom: 0, // No extra padding needed
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Carousel Styles
  imageCarouselContainer: {
    width: '100%',
    height: 350, // Increased height for more prominence
    // Removed marginBottom to allow spacer rectangle to sit directly below
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 0, // No radius at the bottom
    borderBottomRightRadius: 0, // No radius at the bottom
    overflow: 'hidden', // Ensures the image respects the border radius
    shadowColor: '#000', // Added shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderTopLeftRadius: 20, // Add top radius
    borderTopRightRadius: 20, // Add top radius
  },
  imageCarouselFullScreen: {
    position: 'absolute', // Take over the screen
    top: 0,
    left: 0,
    width: '100%',
    height: '100%', // Take full screen height
    borderRadius: 0, // Remove radius in full screen mode
    shadowOpacity: 0, // No shadow in full screen mode
    elevation: 0,
    backgroundColor: 'black', // Ensure black background
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  },
  carouselImage: {
    width: '100%',
    height: 350, // Match container height
    resizeMode: 'cover',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Use 'contain' to fit image within screen without cropping
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 350, // Increased height for placeholder too
    backgroundColor: '#e0e0e0',
    // Removed marginBottom
    borderBottomLeftRadius: 0, // No radius at the bottom
    borderBottomRightRadius: 0, // No radius at the bottom
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderTopLeftRadius: 20, // Add top radius
    borderTopRightRadius: 20, // Add top radius
  },
  propertyImagePlaceholderText: {
    color: '#777',
    fontSize: 16,
    fontStyle: 'italic',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 1, // Ensure dots are above the image
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  // New spacer rectangle style
  spacerRectangle: {
    height: 40, // Height of the rectangle
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background
    marginHorizontal: 0,
    borderTopLeftRadius: 20, // Rounded top corners
    borderTopRightRadius: 20, // Rounded top corners
    marginTop: -40, // Overlap with the image carousel to create a smooth transition
    zIndex: 9, // Ensure it's above the main scroll view content but below the header
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 0,
    padding: 20,
    // Removed shadow properties
    shadowColor: 'transparent', // Explicitly set to transparent to remove shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Removed marginTop as spacerRectangle handles overlap
    marginTop: 0,
    borderTopLeftRadius: 0, // Ensure no top radius as the spacer handles it
    borderTopRightRadius: 0, // Ensure no top radius as the spacer handles it
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailItem: { // For location with icon
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  location: {
    fontSize: 18,
    color: '#555',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60', // Vibrant green
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'justify', // Justify description text
  },
  specsGrid: { // New style for bedrooms/bathrooms layout
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  specItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  specLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 5, // Space between icon and label
  },
  specValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, // Increased spacing
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Lighter divider
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600', // Slightly less bold
    color: '#444',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flexShrink: 1,
    marginLeft: 10,
    textAlign: 'right',
  },
  ownerSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  ownerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  contactInfoRow: { // New style for contact info rows with icons
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ownerText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10, // Space between icon and text
  },
  chatButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 14, // Slightly larger
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    marginTop: 20,
    flexDirection: 'row', // For icon and text
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5, // Space between text and icon
  },
  landlordActions: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusChangeButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  statusChangeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  adminVerificationSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  adminActionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  verifyButton: {
    backgroundColor: '#28a745',
  },
  unverifyButton: {
    backgroundColor: '#dc3545',
  },
  adminActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default PropertyDetailsScreen;
