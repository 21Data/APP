
import {  StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent dark overlay
      justifyContent: 'center', // Distributes content vertically
      alignItems: 'center',     // Centers content horizontally
      padding: 20,
    },
  });