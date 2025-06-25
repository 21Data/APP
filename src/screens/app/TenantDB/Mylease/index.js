// MyrentAbujaFrontend/src/screens/app/MyLeasesScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image,TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requireNativeComponent } from '../../../../../node_modules/react-native/types/index';

const MyLeasesScreen = () => {
  const navigation = useNavigation();

  // Placeholder for a generic header component
  const Header = ({ title, onBackPress }) => (
    <View style={styles.headerContainer}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
         <Image style={styles.icon}source={require('../../../../assets/back.png')} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Leases" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Current and Past Leases</Text>
        <Text style={styles.description}>
          This screen will display details about your active leases and your lease history.
        </Text>
        {/* You will fetch and render lease data here */}
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>No active leases found.</Text>
          <Text style={styles.placeholderText}>Check back later or browse for new properties!</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TenantPropertiesScreen')}>
          <Text style={styles.buttonText}>Browse Properties</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: '#34D399', // Green header for leases
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  placeholderBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  placeholderText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#34D399',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon:{
      width:34,
      height:34
  }
});

export default MyLeasesScreen;
