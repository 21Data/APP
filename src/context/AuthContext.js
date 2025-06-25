// MyrentAbujaFrontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Create the Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'tenant', 'landlord', 'admin'
  const [isLoading, setIsLoading] = useState(true);

  // Function to load authentication state from AsyncStorage
  const loadAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');

      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        setUserToken(token);
        setUserRole(userData.role);
      } else {
        setUserToken(null);
        setUserRole(null);
      }
    } catch (e) {
      console.error('AuthContext: Failed to load auth data from AsyncStorage:', e);
      // Clear storage in case of corrupted data
      await AsyncStorage.clear();
      setUserToken(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load of auth state when provider mounts
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]); // loadAuthState is stable due to useCallback

  // Function to handle login (sets state and AsyncStorage)
  const signIn = useCallback(async (token, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
      setUserRole(userData.role);
    } catch (e) {
      console.error('AuthContext: Error setting auth data during signIn:', e);
      // Handle error, e.g., clear partially set data
      await AsyncStorage.clear();
      setUserToken(null);
      setUserRole(null);
    }
  }, []);

  // Function to handle logout (clears state and AsyncStorage)
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUserRole(null);
    } catch (e) {
      console.error('AuthContext: Error clearing auth data during signOut:', e);
    }
  }, []);

  // Show loading spinner while determining auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ userToken, userRole, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
});
