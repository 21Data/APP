import React, { useState } from 'react';
import { Text, View, Alert, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'; // Added Image, ActivityIndicator
import { styles } from './styles'; // Ensure your styles object has the new styles below

// Import reusable components
import CustomButton from '../../../../components/CustomButton/index';
import InputField from '../../../../components/InputField/index';
import BackgroundWithOverlay from '../../../../components/BackgroundWIthOverlay'; // For background image

// Import ImagePicker
import * as ImagePicker from 'react-native-image-picker';

// Define a placeholder background image for consistency
const SIGNUP_BG_IMAGE = require('../../../../assets/bam.png'); // Ensure this image path is correct

const LandlordSignupScreen = ({ navigation }) => {
  // State variables for landlord registration
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For client-side validation only
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nin, setNin] = useState('');
  // Changed from passportPhotoUrl string to passportImage object for file upload
  const [passportImage, setPassportImage] = useState(null); // Will store the selected image asset

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // IMPORTANT: Replace this with your machine's actual IP address
  // This BASE_URL will be used for signup request.
  // Make sure your backend supports multipart/form-data for image upload on this endpoint.
  const BASE_URL = 'http://172.20.10.2:5000/api'; // <--- CHANGE THIS!

  // Function to select image from gallery
  const selectPassportImage = () => {
    const options = {
      mediaType: 'photo', // We want to select photos
      includeBase64: false, // Generally prefer not to include base64 for direct file upload
      maxHeight: 400,       // Optional: resize image for upload efficiency
      maxWidth: 400,
      quality: 0.7,        // Optional: reduce image quality
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode, response.errorMessage);
        Alert.alert('Image Pick Error', `Failed to pick image: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];
        setPassportImage(selectedAsset);
        console.log('Selected image asset:', selectedAsset);
      }
    });
  };

  const handleSignup = async () => {
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    // --- Client-side validation ---
    if (!name || !dateOfBirth || !email || !password || !confirmPassword || !phone || !address || !nin || !passportImage) { // Check for passportImage
      setErrorMessage('All fields are required, including passport photo.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setErrorMessage('Date of Birth must be in YYYY-MM-DD format.');
      setLoading(false);
      return;
    }
    if (!/^\d{10,15}$/.test(phone)) {
      setErrorMessage('Please enter a valid phone number (10-15 digits).');
      setLoading(false);
      return;
    }
    if (!/^\d{11}$/.test(nin)) {
      setErrorMessage('Please enter a valid 11-digit NIN.');
      setLoading(false);
      return;
    }
    // --- End Validation ---

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // As per your API
        },
        body: JSON.stringify({
          role: 'landlord',
          name: name,
          dateOfBirth: dateOfBirth,
          email: email,
          password: password,
          phone: phone,
          address: address,
          nin: nin,
          passportPhotoUrl: 'passportPhotoUrl', // Sending the URL string
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Signup Success', 'Your landlord account has been created! Please log in.');
        console.log('Landlord signup successful, user:', data.userId);
        navigation.navigate('TenantLogin');
      } else {
        console.error('Signup API error:', data); // Log the full error from API
        setErrorMessage(data.message || data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup network error:', error);
      setErrorMessage('Network error. Could not connect to server or invalid response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWithOverlay imageSource={SIGNUP_BG_IMAGE}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Landlord Sign Up</Text>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <InputField
            label="Full Name"
            placeholder="e.g., Jane Smith"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errorMessage.includes('name') ? errorMessage : ''}
          />

          <InputField
            label="Date of Birth (YYYY-MM-DD)"
            placeholder="e.g., 1985-05-10"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numeric"
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

          <InputField
            label="Residential Address"
            placeholder="e.g., 456 Property St, Wuse, Abuja"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            error={errorMessage.includes('address') ? errorMessage : ''}
          />

          <InputField
            label="NIN (National Identification Number)"
            placeholder="e.g., 12345678901"
            value={nin}
            onChangeText={setNin}
            keyboardType="numeric"
            maxLength={11}
            error={errorMessage.includes('NIN') ? errorMessage : ''}
          />

          {/* Passport Photo Upload Section */}
          <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Passport Picture:</Text>
            <TouchableOpacity onPress={selectPassportImage} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add File</Text>
            </TouchableOpacity>
            {passportImage && (
              <View style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: passportImage.uri }}
                  style={styles.passportImagePreview}
                />
                <Text style={styles.imageName}>{passportImage.fileName || 'Selected Image'}</Text>
              </View>
            )}
            {!passportImage && (
                <Text style={styles.noImageText}>No image selected</Text>
            )}
            {errorMessage.includes('passport photo') && <Text style={styles.errorMessage}>{errorMessage}</Text>}
          </View>

          <InputField
            label="Password"
            placeholder="create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errorMessage.includes('Password') ? errorMessage : ''}
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
            title={loading ? <ActivityIndicator color="#fff" /> : "Create Landlord Account"}
            onPress={handleSignup}
            disabled={
              !name || !dateOfBirth || !email || !password || !confirmPassword ||
              !phone || !address || !nin || !passportImage || loading // Check for passportImage
            }
            style={styles.signupButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TenantLogin')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithOverlay>
  );
};

export default LandlordSignupScreen;