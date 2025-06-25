// MyrentAbujaFrontend/src/screens/app/SettingsScreen.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { signOut, userRole } = useContext(AuthContext); // Get userRole from AuthContext

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  const BASE_URL = 'http://172.20.10.2:5000/api';

  // Modified Header component to use dynamic back navigation
  // eslint-disable-next-line react/no-unstable-nested-components
  const Header = ({ title }) => {
    const handleBackPress = () => {
      // Navigate based on user role to ensure they go back to their specific dashboard
      if (userRole === 'tenant') {
        navigation.navigate('TenantDashboardScreen');
      } else if (userRole === 'landlord') {
        navigation.navigate('LandlordDashboardScreen');
      } else if (userRole === 'admin') {
        navigation.navigate('AdminDashboardScreen');
      } else {
        // Fallback or more generic goBack if role is undefined/unrecognized
        navigation.goBack();
      }
    };

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  };

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        await signOut();
        return;
      }

      console.log('SettingsScreen: Fetching user profile from:', `${BASE_URL}/users/me`);
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SettingsScreen: Error fetching profile. Status:', response.status, 'Response Text:', errorText);
        let errorMessage = 'Failed to fetch profile data.';
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
            console.warn('SettingsScreen: Failed to parse error response as JSON:', parseError);
            errorMessage = `Server responded with non-JSON error (Status: ${response.status}).`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUserData(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      if (data.role === 'landlord') {
        setAddress(data.address || '');
      } else if (data.role === 'tenant') {
        setMaritalStatus(data.maritalStatus || '');
      }

    } catch (err) {
      console.error('SettingsScreen: Catching error during profile fetch:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
      if (err.message.includes('Unauthorized') || err.message.includes('forbidden')) {
        await signOut();
      }
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        await signOut();
        return;
      }

      const updatePayload = {
        name: name,
        email: email,
        phone: phone,
      };

      if (userData?.role === 'landlord') {
        updatePayload.address = address;
      } else if (userData?.role === 'tenant') {
        updatePayload.maritalStatus = maritalStatus;
      }

      console.log('SettingsScreen: Sending update payload:', updatePayload);
      console.log('SettingsScreen: Sending PATCH request to:', `${BASE_URL}/users/me`);

      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const responseText = await response.text();
      console.log('SettingsScreen: Raw server response text:', responseText);
      console.log('SettingsScreen: Server response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to update profile.';
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
            console.warn('SettingsScreen: Failed to parse error response as JSON (it might be HTML or plain text).', parseError);
            errorMessage = `Server responded with a non-JSON error (Status: ${response.status}). Response: "${responseText.substring(0, 100)}..."`;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      Alert.alert('Success', data.message || 'Profile updated successfully!');
      fetchUserProfile();

    } catch (err) {
      console.error('SettingsScreen: Catching error during profile update:', err);
      setError(err.message || 'Network error. Could not update profile.');
      Alert.alert('Error', err.message || 'Network error. Could not update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Navigation to a password change screen will be implemented here.');
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Settings" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Error" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => {
            // Specific back navigation based on user role even for error state
            if (userRole === 'tenant') {
              navigation.navigate('TenantDashboardScreen');
            } else if (userRole === 'landlord') {
              navigation.navigate('LandlordDashboardScreen');
            } else if (userRole === 'admin') {
              navigation.navigate('AdminDashboardScreen');
            } else {
              navigation.goBack(); // Fallback
            }
          }}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.profileCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email:</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Your Email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone:</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Your Phone Number"
            />
          </View>

          {userData?.role === 'landlord' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address:</Text>
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Your Address"
                multiline
              />
            </View>
          )}

          {userData?.role === 'tenant' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Marital Status:</Text>
              <TextInput
                style={styles.textInput}
                value={maritalStatus}
                onChangeText={setMaritalStatus}
                placeholder="Your Marital Status"
              />
            </View>
          )}

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={updating}>
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityCard}>
          <TouchableOpacity style={styles.securityButton} onPress={handleChangePassword}>
            <Text style={styles.securityButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.accountCard}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
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
    backgroundColor: '#3498db',
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  updateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  securityButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  securityButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
