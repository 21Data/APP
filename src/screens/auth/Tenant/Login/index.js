// MyrentAbujaFrontend/screens/TenantLoginScreen.js
import React, { useState, useContext } from 'react';
import { Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native';

// Import reusable components
import CustomButton from '../../../../components/CustomButton/index';
import InputField from '../../../../components/InputField/index';
import BackgroundWithOverlay from '../../../../components/BackgroundWIthOverlay'; // Optional: for background image
import Header from '../../../../components/Header/index'
import {styles} from './styles';
//import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { AuthContext } from '../../../../context/AuthContext';


// Define a placeholder background image for consistency
const LOGIN_BG_IMAGE = require('../../../../assets/bam.png'); // Ensure this image path is correct

const TenantLoginScreen = ({ navigation }) => {
  // Get the signIn function from AuthContext
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // IMPORTANT: Replace this with your machine's actual IP address
  const BASE_URL = 'http://172.20.10.2:5000/api'; // <--- CHANGE THIS!

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
         console.log('Login successful:', data);
        // Call the signIn function from AuthContext to update global state and AsyncStorage
       await signIn(data.token, data.user);
        // NO MANUAL NAVIGATION NEEDED HERE. App.tsx will re-render and switch stacks.

  /*
       Alert.alert('Login Success', 'Welcome back, Tenant!');
      console.log('Login successful, token:', data.token);
  console.log('Login response data:', data); // See structure of response
  const role = data.user?.role?.toLowerCase().trim();
  console.log('Parsed role:', role);
  await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
         // Navigate to tenant dashboard upon successful login
        if (role === 'tenant') {
          navigation.replace('TenantDashboardScreen');
        } else if (role === 'landlord') {
          navigation.replace('LandlordDashboardScreen');
        } else {
          navigation.replace('AdminDashboardScreen');
      }
      */
       } else {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login network error:', error);
      setErrorMessage('Network error. Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWithOverlay imageSource={LOGIN_BG_IMAGE}
    overlayColor=" rgb(152, 255, 152, 0.4)">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.space}>
        <Header title='       ' />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Tenant Login</Text>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <InputField
            label="Email Address"
            placeholder="enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errorMessage.includes('email') ? errorMessage : ''} // Simple error passing
          />

          <InputField
            label="Password"
            placeholder="enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errorMessage.includes('password') ? errorMessage : ''} // Simple error passing
          />

          <CustomButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password || loading} // Disable if fields are empty or loading
            style={styles.loginButton}
          />

          <TouchableOpacity style={styles.link} onPress={() => Alert.alert('Forgot Password', 'Implement navigation to password reset.')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TenantSignup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithOverlay>
  );
};


export default TenantLoginScreen;