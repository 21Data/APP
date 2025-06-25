// MyrentAbujaFrontend/components/RoleSelectorCard.js
import React from 'react';
import { View, Text } from 'react-native';
import CustomButton from '../CustomButton/index'; 
import {styles} from './styles';

const RoleSelectorCard = ({ icon, headline, benefits, buttonTitle, onButtonPress, buttonColor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.headline}>{headline}</Text>
      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <Text key={index} style={styles.benefitText}>• {benefit}</Text>
        ))}
      </View>
      <CustomButton
        title={buttonTitle}
        onPress={onButtonPress}
        style={{ backgroundColor: buttonColor || '#3498db', marginTop: 15 }} // Apply dynamic color
      />
    </View>
  );
};


export default RoleSelectorCard;