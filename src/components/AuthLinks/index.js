
import React from 'react';
import { View, Text,  TouchableOpacity } from 'react-native';
import {styles} from './styles';

const AuthLinks = ({ onLoginPress, onSignupPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.linkGroup}>
        <Text style={styles.text}>Already have an account?</Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text style={styles.linkButton}>Login</Text>
        </TouchableOpacity>
      </View>

     
    </View>
  );
};


export default AuthLinks;

