import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 30,
    },
    card: {
      width: '90%',
      maxWidth: 450,
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
    signupButton: {
      marginTop: 25,
      width: '100%',
      backgroundColor: '#3498db', // Consistent primary button color for landlord signup
    },
    loginContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    loginText: {
      color: '#555',
      fontSize: 14,
    },
    loginLink: {
      color: '#2ecc71', // A secondary brand color for login link
      fontSize: 14,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    imageUploadContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10, // Added margin top to separate from previous input
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
    },
    addButton: {
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 10,
      alignSelf: 'center', // Center the button
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    imagePreviewWrapper: {
      marginTop: 10,
      alignItems: 'center',
    },
    passportImagePreview: {
      width: 100,
      height: 100,
      borderRadius: 50, // For a circular passport photo look
      resizeMode: 'cover',
      borderWidth: 2,
      borderColor: '#007bff', // Highlight with a border
    },
    imageName: {
      marginTop: 5,
      fontSize: 14,
      color: '#555',
      textAlign: 'center',
    },
    noImageText: {
      marginTop: 10,
      color: '#888',
      fontStyle: 'italic',
    },
    // Ensure your existing errorMessage style is defined
    errorMessage: {
      color: 'red',
      marginBottom: 10,
      textAlign: 'center',
    },
    // Make sure your custom button styles are accessible or defined
    signupButton: {
      marginTop: 20,
      // Add specific styles if needed for CustomButton
    },
    loginContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    loginText: {
      color: 'black',
    },
    loginLink: {
      color: '#007bff',
      fontWeight: 'bold',
    },
    // Add these if they are not already in your styles
    card: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 28, // Slightly larger title
      fontWeight: 'bold',
      marginBottom: 20, // Adjust margin
      color: '#333',
    },
  });
  