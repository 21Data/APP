import React from 'react';
import { Text, ImageBackground, View, ScrollView, TouchableOpacity } from 'react-native';
//import { Ionicons, MaterialIcons } from 'react-native-vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { styles } from './styles'; // Importing styles from the separate styles file

// Background image path
const LANDING_BG_IMAGE = require('../../../assets/bam.png'); // Replace with your actual image path

console.log('LandingPage component is loading!');

const LandingPage = ({ navigation }) => {
  const handleBrowseProperties = () => {
    // Navigate to tenant property browsing screen
    console.log('Navigating to Tenant Property Browse...');
    navigation.navigate('TenantSignup'); // Temporarily navigate to TenantLogin
    // Replace with 'TenantPropertyBrowser' later
  };

  const handleListProperty = () => {
    // Navigate to landlord property listing screen
    console.log('Navigating to Landlord Property List...');
    navigation.navigate('LandlordSignup'); // Temporarily navigate to LandlordLogin
    // Replace with 'LandlordPropertyLister' later
  };

  const handleLogin = () => {
    console.log('Navigating to Login options...');
    navigation.navigate('TenantLogin'); // For now, navigate to TenantLogin
  };

  const handleSignup = () => {
    console.log('Navigating to Signup options...');
    navigation.navigate('TenantSignup'); // For now, navigate to TenantSignup
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Background with Overlay */}
      <View style={styles.backgroundContainer}>
        <ImageBackground source={LANDING_BG_IMAGE} style={styles.backgroundImage}>
          {/* Headline Section */}
          <View style={styles.headlineContainer}>
            <Text style={styles.appTitle}>MyRentAbuja</Text>
            <Text style={styles.tagline}>Find your ideal home in Abuja, effortlessly.</Text>
            <Text style={styles.subTagline}>Connecting tenants with trusted landlords in an easy and secure way.</Text>
          </View>

          {/* Role Selection Section */}
          <View style={styles.roleSelectionContainer}>
            {/* Tenant Option */}
            <View style={styles.roleCard}>
              <Ionicons name="home" size={50} color="#fff" style={styles.icon} />
              <Text style={styles.cardTitle}>Looking for a Home?</Text>
              <Text style={styles.cardDescription}>
                Browse verified listings, contact landlords directly, and filter properties based on your needs.
              </Text>
              <TouchableOpacity style={[styles.button, styles.tenantButton]} onPress={handleBrowseProperties}>
                <Text style={styles.buttonText}>Start Your Search</Text>
              </TouchableOpacity>
            </View>

            {/* Landlord Option */}
            <View style={styles.roleCard}>
              <MaterialIcons name="business-center" size={50} color="#fff" style={styles.icon} />
              <Text style={styles.cardTitle}>Have a Property to Rent?</Text>
              <Text style={styles.cardDescription}>
                List your property commission-free, manage listings, and connect with interested tenants.
              </Text>
              <TouchableOpacity style={[styles.button, styles.landlordButton]} onPress={handleListProperty}>
                <Text style={styles.buttonText}>List Your Property</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login/Signup Links */}
          <View style={styles.authLinks}>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.authLinkText}>Already have an account? Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.authLinkText}>New here? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

export default React.memo(LandingPage);
