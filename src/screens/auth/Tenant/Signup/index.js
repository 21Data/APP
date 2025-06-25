// MyrentAbujaFrontend/screens/TenantSignupScreen.js
import React, { useState } from 'react';
import {  Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import {styles} from './styles';

// Import reusable components
import CustomButton from '../../../../components/CustomButton/index';
import InputField from '../../../../components/InputField/index';
import BackgroundWithOverlay from '../../../../components/BackgroundWIthOverlay'; // For background image
import { Picker } from '@react-native-picker/picker';

// Define a placeholder background image for consistency
const SIGNUP_BG_IMAGE = require('../../../../assets/bam.png'); // Ensure this image path is correct
const MARITAL_STATUS_OPTIONS = [
    { label: 'Select Marital Status', value: '' }, // Default/placeholder option
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
    { label: 'Divorced', value: 'Divorced' },
    { label: 'Widowed', value: 'Widowed' },
    // Add more options if needed
  ];

const TenantSignupScreen = ({ navigation }) => {
    // State variables strictly matching API documentation fields for tenant registration
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // For client-side validation only
    const [phone, setPhone] = useState('');
    const [maritalStatus, setMaritalStatus] = useState(''); // E.g., 'Single', 'Married', 'Divorced'
  
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    // IMPORTANT: Replace this with your machine's actual IP address
    const BASE_URL = 'http://172.20.10.2:5000/api'; // <--- CHANGE THIS!
  
    const handleSignup = async () => {
      setLoading(true);
      setErrorMessage(''); // Clear previous errors
  
      // --- Client-side validation based on API requirements ---
      if (!name || !dateOfBirth || !email || !password || !confirmPassword || !phone || !maritalStatus) {
        setErrorMessage('All fields are required.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) { // Assuming a minimum password length of 6, adjust if API has a different rule
        setErrorMessage('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      // Basic email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      // Basic date format validation (YYYY-MM-DD) - can be more robust
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
          setErrorMessage('Date of Birth must be in YYYY-MM-DD format.');
          setLoading(false);
          return;
      }
      // --- End Validation ---
  
      try {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'tenant', // As per API documentation for tenant registration
            name: name,
            dateOfBirth: dateOfBirth,
            email: email,
            password: password,
            phone: phone,
            maritalStatus: maritalStatus,
          }),
        });
  
        const data = await response.json();
      if (response.ok) {
        Alert.alert('Signup Success', 'Your account has been created! Please log in.');
        console.log('Tenant signup successful, user:', data.userId);
        navigation.navigate('TenantLogin'); // Navigate back to TenantLogin after successful signup
      } else {
        setErrorMessage(data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup network error:', error);
      setErrorMessage('Network error. Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };
  
    return (
      <BackgroundWithOverlay imageSource={SIGNUP_BG_IMAGE}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.title}>Tenant Sign Up</Text>
  
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
  
            <InputField
              label="Full Name"
              placeholder="e.g., John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errorMessage.includes('name') ? errorMessage : ''}
            />
  
            <InputField
              label="Date of Birth (YYYY-MM-DD)"
              placeholder="e.g., 1990-01-01"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="numeric" // Or 'default' if you want to allow hyphens
              error={errorMessage.includes('Date of Birth') ? errorMessage : ''}
            />
  
            <InputField
              label="Email Address"
              placeholder="your@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errorMessage.includes('email') ? errorMessage : ''}
            />
  
            <InputField
              label="Phone Number"
              placeholder="e.g., 08012345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errorMessage.includes('phone') ? errorMessage : ''}
            />
  
  <View style={styles.inputGroup}>
            <Text style={styles.pickerLabel}>Marital Status</Text>
            <View style={[styles.pickerContainer, errorMessage.includes('Marital Status') && styles.pickerError]}>
              <Picker
                selectedValue={maritalStatus}
                onValueChange={(itemValue, itemIndex) => setMaritalStatus(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // Style for individual items (iOS only)
              >
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
            {errorMessage.includes('Marital Status') && <Text style={styles.errorText}>Marital Status is required.</Text>}
          </View>
  
            <InputField
              label="Password"
              placeholder="create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errorMessage.includes('Password must be') || errorMessage.includes('match') ? errorMessage : ''}
            />
  
            <InputField
              label="Confirm Password"
              placeholder="re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errorMessage.includes('match') ? errorMessage : ''}
            />
  
            <CustomButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={!name || !dateOfBirth || !email || !password || !confirmPassword || !phone || !maritalStatus || loading}
              style={styles.signupButton}
            />
  
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => Alert.alert('Login', 'Implement navigation to tenant login.')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </BackgroundWithOverlay>
    );
  };

export default TenantSignupScreen;