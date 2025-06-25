
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    card: {
      backgroundColor: 'rgba(255,255,255, .2)', // Slightly transparent white card
      borderRadius: 16,
      padding: 20,
      marginVertical: 10,
      width: '90%', // Adjust width as needed for desired layout
      maxWidth: 350, // Max width for larger screens
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8, // Android shadow
    },
    icon: {
      fontSize: 40,
      marginBottom: 10,
    },
    headline: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
    },
    benefitsContainer: {
      alignSelf: 'flex-start', // Align benefits to the left within the card
      marginBottom: 15,
    },
    benefitText: {
      fontSize: 14,
      color: '#555',
      marginBottom: 5,
    },
  });
  