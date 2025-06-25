
import React from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import {styles} from './styles';

const BackgroundWithOverlay = ({ children, imageSource,  overlayColor = 'rgba(0,0,0,0.3)' }) => {
  return (
    <ImageBackground source={imageSource} style={styles.background} resizeMode="cover">
      <View style={styles.overlay, {backgroundColor: overlayColor} }>
        {children}
      </View>
    </ImageBackground>
  );
};

export default BackgroundWithOverlay;