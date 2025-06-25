import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    container: {
      marginTop: 30,
      alignItems: 'center',
    },
    linkGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    text: {
      color: '#E0E0E0', // Light grey text to stand out on dark overlay
      fontSize: 15,
      marginRight: 5,
      textShadowColor: 'rgba(0, 0, 0, 0.5)', // Subtle shadow for readability
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    linkButton: {
      color: '#3498db', // Brand color for links
      fontSize: 16,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
  });
  