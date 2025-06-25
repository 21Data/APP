// MyrentAbujaFrontend/src/screens/app/ChatScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal, // Import Modal for the profile popup
  Pressable, // Import Pressable for modal backdrop
} from 'react-native';
import { SvgXml } from 'react-native-svg'; // Import SvgXml for inline SVG
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.20.10.2:5000/api'; // IMPORTANT: Replace with your actual backend URL

// Inline SVG for a user icon
const userIconXml = `
<svg fill="#ffffff" viewBox="0 0 24 24" id="user" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line">
  <path id="primary" d="M16.07,17.41a9,9,0,1,0-8.14,0A4,4,0,0,0,2,21v1H22V21A4,4,0,0,0,16.07,17.41ZM12,13a4,4,0,1,0-4-4A4,4,0,0,0,12,13Z"></path>
</svg>
`;

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { propertyId, participantId, propertyTitle, participantName } = route.params;

  // State variables for chat functionality
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // State variables for participant profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [participantProfile, setParticipantProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Ref for FlatList to automatically scroll to the bottom
  const flatListRef = useRef(null);

  // Custom Header component
  const Header = ({ title, onBackPress, onProfilePress }) => (
    <View style={styles.headerContainer}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {onProfilePress && ( // Conditionally render profile icon
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          {/* Replaced FontAwesome5 with inline SVG */}
          <SvgXml xml={userIconXml} width="24" height="24" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Function to fetch current user's ID and token from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          setUserToken(token);
          setCurrentUserId(JSON.parse(userData).id);
        } else {
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.replace('TenantLogin'); // Or appropriate login screen
        }
      } catch (e) {
        console.error("Failed to load user data from AsyncStorage:", e);
        Alert.alert('Error', 'Failed to load user session. Please try logging in again.');
      }
    };
    fetchUserData();
  }, [navigation]);

  // Function to fetch messages from the backend
  const fetchMessages = useCallback(async () => {
    if (!userToken || !currentUserId || !propertyId || !participantId) {
      console.log('ChatScreen: Waiting for user data to fetch messages.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log(`ChatScreen: Fetching messages for propertyId: ${propertyId}, participantId: ${participantId}`);
      const response = await fetch(`${BASE_URL}/messages?propertyId=${propertyId}&participantId=${participantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }

      if (data.length === 0) {
        console.log('ChatScreen: No existing messages found. Starting a new conversation.');
      }

    } catch (err) {
      console.error('ChatScreen: Error fetching messages:', err);
      setError(err.message || 'Failed to load messages. Please try again.');
      Alert.alert('Error', err.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [userToken, currentUserId, propertyId, participantId]);

  // Effect to fetch messages when user data is available or params change
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Function to send a new message
  const handleSendMessage = async () => {
    if (!newMessageText.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }
    if (!userToken || !currentUserId || !propertyId || !participantId) {
      Alert.alert('Error', 'Chat setup incomplete. Please ensure you are logged in and all chat parameters are valid.');
      console.error('ChatScreen: Attempted to send message before full setup:', {
        userToken: !!userToken,
        currentUserId: !!currentUserId,
        propertyId: !!propertyId,
        participantId: !!participantId
      });
      return;
    }

    setSending(true);
    setError('');
    try {
      console.log(`ChatScreen: Sending message from ${currentUserId} to ${participantId} about property ${propertyId}`);
      const response = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: participantId,
          propertyId: propertyId,
          message: newMessageText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      console.log('ChatScreen: Message sent successfully:', data);

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: data.messageId,
          senderId: currentUserId,
          recipientId: participantId,
          propertyId: propertyId,
          message: newMessageText,
          timestamp: data.timestamp,
        },
      ]);
      setNewMessageText('');

      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }

    } catch (err) {
      console.error('ChatScreen: Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      Alert.alert('Error', err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Function to fetch participant profile details
  const fetchParticipantProfile = useCallback(async () => {
    if (!userToken || !participantId) {
      setProfileError('Authentication token or participant ID missing.');
      return;
    }

    setLoadingProfile(true);
    setProfileError('');
    try {
      // IMPORTANT: This assumes a /api/users/:id endpoint on your backend
      // that returns user details including name, role, and properties_listed (if landlord).
      const response = await fetch(`${BASE_URL}/users/${participantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`${BASE_URL}/users/${participantId}`);
      console.log(`her: ${response.ok}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch participant profile');
      }

      const data = await response.json();
      setParticipantProfile(data); // Assuming data structure: { id, name, email, role, properties_listed (optional) }
      console.log(`data: ${data.role}`);
    } catch (err) {
      console.error('ChatScreen: Error fetching participant profile:', err);
      setProfileError(err.message || 'Failed to load profile.');
    } finally {
      setLoadingProfile(false);
    }
  }, [userToken, participantId]);

  // Handler for opening the profile modal
  const handleOpenProfileModal = () => {
    setShowProfileModal(true);
    fetchParticipantProfile(); // Fetch profile when modal opens
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={`Chat with ${participantName || '...'}`} onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Chat Error" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Chat about "${propertyTitle}" with ${participantName}`}
        onBackPress={() => navigation.goBack()}
        onProfilePress={handleOpenProfileModal} // Pass the handler to the Header
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 && (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesText}>
              No messages yet. Send the first message to start the conversation!
            </Text>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.senderId === currentUserId ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessageText}
            onChangeText={setNewMessageText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sending || !newMessageText.trim()}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Participant Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfileModal}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowProfileModal(false)}>
          <View style={styles.modalView}>
            {loadingProfile ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : profileError ? (
              <Text style={styles.modalErrorText}>{profileError}</Text>
            ) : participantProfile ? (
              <View>
                <Text style={styles.modalTitle}>Participant Profile</Text>
                <Text style={styles.modalText}>Name: {participantProfile.name}</Text>
                <Text style={styles.modalText}>Role: {participantProfile.role}</Text>
                <Text style={styles.modalText}>Marital Status: {participantProfile.maritalStatus}</Text>
                <Text style={styles.modalText}>Date of Birth: {participantProfile.dateOfBirth}</Text>
                <Text style={styles.modalText}>Address: {participantProfile.address}</Text>
                <Text style={styles.modalText}>Phone: {participantProfile.phone}</Text>
                {/* Conditionally display properties_listed only if role is landlord */}
                {participantProfile.role === 'landlord' && participantProfile.properties_listed !== undefined ? (
                  <Text style={styles.modalText}>Properties Listed: {participantProfile.properties_listed}</Text>
                ):null}
                {/* You can add more profile details here */}
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProfileModal(false)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
                <View>
                    <Text style={styles.modalText}>No profile data available.</Text>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProfileModal(false)}>
                        <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for chat
  },
  headerContainer: {
    backgroundColor: '#3498db',
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
    padding: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Allow title to take available space
    marginHorizontal: 50, // Ensure space for back button
  },
  profileButton: {
    position: 'absolute',
    right: 15,
    top: 40,
    padding: 5,
  },
  container: {
    flex: 1,
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
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMessagesText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
    marginHorizontal: 10,
    maxWidth: '75%',
    flexDirection: 'column',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6', // Light green for sender's messages
    borderBottomRightRadius: 5, // Tweak for message tail
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff', // White for recipient's messages
    borderBottomLeftRadius: 5, // Tweak for message tail
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 120, // Prevent input from growing too large
  },
  sendButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Make modal responsive
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  modalErrorText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#e74c3c',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#9B59B6',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatScreen;
