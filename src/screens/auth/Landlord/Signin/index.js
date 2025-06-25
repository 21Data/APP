import React, { useState } from 'react';
import {  Text, View, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';


// Import reusable components
import CustomButton from '../../../../components/CustomButton/index';
import InputField from '../../../../components/InputField/index';
import BackgroundWithOverlay from '../../../../components/BackgroundWIthOverlay'; // For background image


// Define a placeholder background image for consistency
const LOGIN_BG_IMAGE = require('../../../../assets/bam.png'); // Ensure this image path is correct

const LandlordLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // IMPORTANT: Replace this with your machine's actual IP address
  const BASE_URL = 'http://172.20.10.2:5000/api'; // <--- CHANGE THIS!

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    // --- Client-side validation ---
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }
    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    // --- End Validation ---

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, { // API endpoint from documentation
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Request body fields from documentation
      });

      const data = await response.json();
      if (response.ok) {
        // Here you would typically store the token (e.g., using AsyncStorage)
        // and then navigate to the landlord's main dashboard.
        Alert.alert('Login Success', 'Welcome back, Landlord!');
        console.log('Landlord login successful, token:', data.token); // Access token from response
        navigation.navigate('LandlordDashboard');
        // Example: navigate to landlord dashboard (requires a navigation library)
        // navigation.navigate('LandlordDashboard', { token: data.token });
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
    <BackgroundWithOverlay imageSource={LOGIN_BG_IMAGE}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Landlord Login</Text>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <InputField
            label="Email Address"
            placeholder="enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errorMessage.includes('email') ? errorMessage : ''}
          />

          <InputField
            label="Password"
            placeholder="enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errorMessage.includes('password') ? errorMessage : ''}
          />

          <CustomButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password || loading}
            style={styles.loginButton}
          />

          <TouchableOpacity style={styles.link} onPress={() => Alert.alert('Forgot Password', 'Implement navigation to password reset.')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => Alert.alert('Sign Up', 'Implement navigation to landlord registration.')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithOverlay>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#3498db', // Consistent primary button color
  },
  link: {
    marginTop: 15,
    marginBottom: 10,
  },
  linkText: {
    color: '#3498db', // Primary brand color for links
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#555',
    fontSize: 14,
  },
  signUpLink: {
    color: '#2ecc71', // A secondary brand color for signup
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LandlordLoginScreen;