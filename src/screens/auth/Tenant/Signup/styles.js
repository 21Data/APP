import {StyleSheet } from 'react-native';


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
      backgroundColor: '#2ecc71',
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
      color: '#3498db',
      fontSize: 14,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    inputGroup: { // Reusable style for label + input/picker combination
        width: '100%',
        marginBottom: 15,
      },
      pickerLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: 'bold',
      },
      pickerContainer: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center', // Center picker content vertically
        overflow: 'hidden', // Ensure borderRadius clips content
      },
      picker: {
        height: 50,
        width: '100%',
        color: '#333', // Text color inside the picker
      },
      pickerItem: { // Applies to individual items, mostly on iOS
        fontSize: 16,
      },
      pickerError: {
        borderColor: '#e74c3c', // Red border for error state
      },
      errorText: { // Reused from InputField's errorText style
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
      },
  });
  