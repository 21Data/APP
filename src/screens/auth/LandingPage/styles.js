import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  backgroundContainer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    width: width,
    height: height,
    opacity: 0.8, // Dim the background image for better text visibility
  },
  headlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 45,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  subTagline: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    width: '100%',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  roleCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    width: '45%',
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    margin: 10,
    fontFamily: 'Ionicons',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantButton: {
    backgroundColor: '#2ecc71',
  },
  landlordButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  authLinks: {
    marginTop: 20,
    alignItems: 'center',
  },
  authLinkText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
});
