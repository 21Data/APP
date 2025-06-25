import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    button: {
      backgroundColor: '#3498db', // Default primary blue
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120, // Ensure a minimum width for buttons
      marginVertical: 5,
    },
    buttonDisabled: {
      backgroundColor: '#cccccc', // Lighter grey for disabled state
    },
    buttonText: {
      color: '#ffffff', // Default white text
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonTextDisabled: {
      color: '#888888', // Darker grey text for disabled state
    },
  });