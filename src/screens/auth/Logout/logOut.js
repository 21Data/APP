import  { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const logout = async () => {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      // Redirect to the landing or login screen
      navigation.replace('Landing');
    };

    logout();
  }, [navigation]);
  console.log('loggedout loaded');
  return null; // No UI needed, just the redirect happens
};

export default LogoutScreen;
