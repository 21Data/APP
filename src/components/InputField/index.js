// MyrentAbujaFrontend/components/InputField.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {styles} from './styles';

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, error }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]} // Apply error style if error prop is true/exists
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      ></TextInput>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};


export default InputField;