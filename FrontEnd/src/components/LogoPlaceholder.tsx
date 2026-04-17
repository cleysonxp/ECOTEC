import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/colors';

export const LogoPlaceholder: React.FC = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 100,
  },
});
