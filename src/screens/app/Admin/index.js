// MyrentAbujaFrontend/src/screens/app/AdminDB/AdminDashboardScreen.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const {signOut} = useContext(AuthContext);
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Admin');
  const [userFullName, setUserFullName] = useState('Admin User');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);

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

  // Function to fetch admin profile
  const fetchAdminProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      if (!userToken) {
        setError('Authentication token not found. Please log in again.');
        navigation.replace('AdminLogin'); // Assuming you'll have an admin login screen
        return;
      }

      let parsedUserData = null;
      if (storedUserData) {
        parsedUserData = JSON.parse(storedUserData);
        setUserName(parsedUserData.name.split(' ')[0] || 'Admin');
        setUserFullName(parsedUserData.name || 'Admin User');
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
        throw new Error(errorData.error || 'Failed to fetch admin profile');
      }

      const freshUserData = await response.json();
      if (freshUserData.role !== 'admin') {
        setError('Access Forbidden: You are not authorized to view this page.');
        // Redirect to a non-admin dashboard if not an admin
        navigation.replace('Landing'); // Or TenantDashboard/LandlordDashboard
        return;
      }
      setUserName(freshUserData.name.split(' ')[0] || 'Admin');
      setUserFullName( 'Admin User');

      // After profile, fetch dashboard stats
      await fetchDashboardStats(userToken);

    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      navigation.replace('LandlordLogin'); // Fallback to a general login if admin login not separate
    } finally {
      setLoadingProfile(false);
    }
  }, [navigation]);
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

  // Function to fetch dashboard statistics
  const fetchDashboardStats = async (token) => {
    setLoadingStats(true);
    try {
      // Fetch Total Users
      const usersResponse = await fetch(`${BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        setTotalUsers(usersData.length);
      } else {
        console.error('Failed to fetch total users:', usersData.error);
        setError(usersData.error || 'Failed to fetch user count.');
      }

      // Fetch All Properties and calculate pending verifications
      const propertiesResponse = await fetch(`${BASE_URL}/properties`, { // Assuming this new endpoint
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propertiesData = await propertiesResponse.json();
      if (propertiesResponse.ok) {
        setTotalProperties(propertiesData.length);
        const pending = propertiesData.filter(prop => prop.verified === false).length;
        setPendingVerifications(pending);
      } else {
        console.error('Failed to fetch properties for stats:', propertiesData.error);
        setError(prev => prev + '\n' + (propertiesData.error || 'Failed to fetch property stats.'));
      }

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(prev => prev + '\n' + (err.message || 'Network error fetching stats.'));
    } finally {
      setLoadingStats(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAdminProfile();
    }, [fetchAdminProfile])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Admin Dashboard" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loadingProfile ? (
          <ActivityIndicator size="small" color="#5D5FEF" style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={styles.errorMessage}>{error}</Text>
        ) : (
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userFullName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{userFullName}</Text>
              <Text style={styles.profileRole}>Administrator • MyRentAbuja</Text>
            </View>
          </View>
        )}

        <Text style={styles.welcomeGreeting}>Welcome, {userName}!</Text>

        {loadingStats ? (
          <ActivityIndicator size="large" color="#5D5FEF" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#FFDDC1' }]}>
              <Text style={styles.statNumber}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#D4EDDA' }]}>
              <Text style={styles.statNumber}>{totalProperties}</Text>
              <Text style={styles.statLabel}>Total Properties</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F8D7DA' }]}>
              <Text style={styles.statNumber}>{pendingVerifications}</Text>
              <Text style={styles.statLabel}>Pending Verifications</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#CCE5FF' }]}>
              <Text style={styles.statNumber}>...</Text>
              <Text style={styles.statLabel}>Other Metrics</Text>
            </View>
          </View>
        )}

        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Admin Management</Text>
          <TouchableOpacity
            style={styles.managementButton}
            onPress={() => alert('Navigate to User Management Screen')}
          >
            <Text style={styles.managementButtonText}>Manage Users 👥</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.managementButton}
            onPress={() => alert('Navigate to Property Verification Screen')}
          >
            <Text style={styles.managementButtonText}>Verify Properties ✅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.managementButton}
            onPress={() => navigation.replace('AdminPropertiesScreen')}
          >
            <Text style={styles.managementButtonText}>View All Properties 🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.managementButton}
            onPress={() => alert('Navigate to System Settings')}
          >
            <Text style={styles.managementButtonText}>System Settings ⚙️</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation (Simplified for Admin) */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navTextActive}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Text style={styles.navText}>👤 Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Text style={styles.navText}>🚪 Logout</Text>
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
  headerContainer: {
    backgroundColor: '#5D5FEF', // Admin theme color (Purple-Blue)
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: '#3498db', // Blue avatar for admin
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2, // Two cards per row
    height: 120,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    padding: 10,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  managementSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  managementButton: {
    backgroundColor: '#6A5ACD', // Medium purple for management buttons
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  managementButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#5D5FEF', // Active color for admin nav
    marginTop: 2,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
