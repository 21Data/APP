import {StyleSheet} from 'react-native';
export const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 15, // Space between input fields
    },
    label: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
      fontWeight: 'bold',
    },
    input: {
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      backgroundColor: '#fff', // White background for the input field
      fontSize: 16,
      color: '#333',
    },
    inputError: {
      borderColor: '#e74c3c', // Red border for error state
    },
    errorText: {
      color: '#e74c3c',
      fontSize: 12,
      marginTop: 5,
      marginLeft: 5,
    },
  });