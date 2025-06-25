// MyrentAbujaFrontend/src/screens/app/LandlordDB/LandlordMessagesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

const MessagesScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

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

  // Function to fetch current user's ID and token from AsyncStorage
  // This is crucial for authentication when fetching conversations
  const fetchUserData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        setUserToken(token);
        setCurrentUserId(JSON.parse(userData).id);
      } else {
        // If no token, user is not logged in, navigate to login
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.replace('TenantLogin'); // Or appropriate login screen
      }
    } catch (e) {
      console.error("Failed to load user data from AsyncStorage:", e);
      Alert.alert('Error', 'Failed to load user session. Please try logging in again.');
    }
  }, [navigation]);

  // Function to fetch active conversations for the landlord from the backend
  const fetchLandlordConversations = useCallback(async () => {
    if (!userToken) {
      console.log('LandlordMessagesScreen: User token not available yet, cannot fetch conversations.');
      return; // Do not proceed without token
    }

    setLoading(true);
    setError(''); // Clear previous errors
    try {
      // IMPORTANT: This API endpoint is hypothetical. You need to implement this
      // on your backend to return a list of active conversation threads for the authenticated landlord.
      // Example structure: [{ propertyId, participantId, propertyTitle, participantName, lastMessage, lastMessageTime }]
      const response = await fetch(`${BASE_URL}/messages/my-conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data); // Set the fetched conversations
      console.log('LandlordMessagesScreen: Conversations fetched:', data);

      // If 'data' is an empty array, it means no conversations exist,
      // and the UI will naturally display the 'no conversations' card.

    } catch (err) {
      console.error('LandlordMessagesScreen: Error fetching landlord conversations:', err);
      setError(err.message || 'Failed to load conversations.');
      Alert.alert('Error', err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, [userToken]); // Depend on userToken so it re-fetches when token is available

  // Use useEffect to fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Use useFocusEffect to fetch conversations whenever the screen is focused
  // This ensures the conversation list is always up-to-date
  useFocusEffect(
    useCallback(() => {
      // Only fetch conversations if userToken is already set
      if (userToken) {
        fetchLandlordConversations();
      }
    }, [fetchLandlordConversations, userToken]) // Ensure it re-runs if userToken becomes available
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('ChatScreen', {
        propertyId: item.propertyId,
        participantId: item.participantId, // This is the tenant's ID
        propertyTitle: item.propertyTitle,
        participantName: item.participantName,
        chatType: 'landlord-to-tenant' // Indicate chat type for logic in ChatScreen
      })}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.participantName ? item.participantName.charAt(0) : '?'}</Text>
      </View>
      <View style={styles.conversationDetails}>
        <Text style={styles.conversationTitle}>{item.propertyTitle} - {item.participantName}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet.'}</Text>
      </View>
      <Text style={styles.timestamp}>
        {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Messages" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Conversations</Text>
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator size="large" color="#9B59B6" style={styles.loadingIndicator} />
        ) : conversations.length === 0 ? (
          <View style={styles.noConversationsCard}>
            <Text style={styles.noConversationsText}>No active conversations found.</Text>
            <Text style={styles.noConversationsSubText}>Messages from tenants about your properties will appear here.</Text>
            <TouchableOpacity style={styles.browsePropertiesButton} onPress={() => navigation.navigate('LandlordPropertiesScreen')}>
              <Text style={styles.browsePropertiesButtonText}>View My Properties</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id} // Assuming each conversation has a unique ID
            scrollEnabled={false} // FlatList inside ScrollView generally means scrollEnabled should be false for FlatList
            contentContainerStyle={styles.conversationList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerContainer: {
    backgroundColor: '#9B59B6', // Purple for messages header
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
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  noConversationsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 50,
  },
  noConversationsText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  noConversationsSubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  browsePropertiesButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  browsePropertiesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationList: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db', // Blue for avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  conversationDetails: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
});


export default MessagesScreen;
