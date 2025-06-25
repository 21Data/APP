
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import {styles} from './styles';

const CustomButton = ({ title, onPress, style, textStyle, disabled = false, loading = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading} // Disable if explicitly disabled or if loading
      activeOpacity={0.7} // How much the button opacity should decrease when touched
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" /> // Show loader if loading
      ) : (
        <Text style={[styles.buttonText, textStyle, disabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};



export default CustomButton;