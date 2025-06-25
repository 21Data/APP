// MyrentAbujaFrontend/src/screens/app/PropertyDetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminPropertyDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { propertyId: initialPropertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false); // New state for verification loading

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
        // Navigate based on expected role, or to a generic login
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
      setProperty(data); // Set the fetched property data
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError(err.message || 'Failed to load property details. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('TenantLogin'); // Or LandlordLogin or AdminLogin
      }
    } finally {
      setLoading(false);
    }
  }, [initialPropertyId, navigation, currentUserRole]); // Add currentUserRole to dependencies

  // Use useFocusEffect to refetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPropertyDetails();
    }, [fetchPropertyDetails])
  );

  const handleChatWithLandlord = () => {
    if (!property || !property.owner) {
      Alert.alert('Error', 'Landlord information not available.');
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

  // NEW: Admin verification function
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
        fetchPropertyDetails(); // Re-fetch property details to update UI
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

  // Determine if the current user is the owner of this property
  const isOwner = currentUserId === property.owner?.id;
  const isAdminUser = currentUserRole === 'admin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={property.title} onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.container}>
        {property.images && property.images.length > 0 ? (
          <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
        ) : (
          <View style={styles.propertyImagePlaceholder}>
            <Text style={styles.propertyImagePlaceholderText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.detailsCard}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>📍 {property.location}</Text>
          <Text style={styles.price}>₦{property.price.toLocaleString()}/month</Text>
          <Text style={styles.description}>{property.description}</Text>

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
            <Text style={styles.infoValue}>{property.verified ? 'Yes ✅' : 'No ⏳'}</Text>
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
                    <Text style={styles.adminActionButtonText}>Unverify Property ❌</Text>
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
                    <Text style={styles.adminActionButtonText}>Verify Property ✅</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {isOwner && !isAdminUser ? ( // Render landlord actions if owner and NOT admin
            <View style={styles.landlordActions}>
              <Text style={styles.ownerTitle}>Your Property Actions</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProperty}>
                <Text style={styles.editButtonText}>Edit Property Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statusChangeButton} onPress={handleChangeStatus}>
                <Text style={styles.statusChangeButtonText}>Change Status ({property.isOccupied ? 'Occupied' : 'Vacant'})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('LandlordMessagesScreen')}>
                <Text style={styles.chatButtonText}>View Related Messages 💬</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Tenant specific actions (or non-owner/non-admin view)
            !isAdminUser && property.owner && (
              <View style={styles.ownerSection}>
                <Text style={styles.ownerTitle}>Contact Landlord</Text>
                <Text style={styles.ownerText}>Name: {property.owner.name}</Text>
                <Text style={styles.ownerText}>Email: {property.owner.email}</Text>
                <Text style={styles.ownerText}>Phone: {property.owner.phone}</Text>
                <TouchableOpacity style={styles.chatButton} onPress={handleChatWithLandlord}>
                  <Text style={styles.chatButtonText}>Chat with Landlord 💬</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
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
    backgroundColor: '#3498db', // Consistent blue header
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  propertyImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  propertyImagePlaceholderText: {
    color: '#777',
    fontSize: 16,
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  location: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
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
    marginBottom: 10,
  },
  ownerText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  chatButton: {
    backgroundColor: '#9B59B6', // Purple chat button
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  landlordActions: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChangeButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  statusChangeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminVerificationSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  adminActionButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButton: {
    backgroundColor: '#28a745', // Green for verify
  },
  unverifyButton: {
    backgroundColor: '#dc3545', // Red for unverify
  },
  adminActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminPropertyDetailsScreen;
