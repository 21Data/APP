import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, // Ensures content can grow and scroll
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30, // Some vertical padding
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(240, 63, 5, 0.81)', // Slightly transparent white card
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10, // Android shadow
    marginTop: 50,
  },
  space:{
    marginTop:80,

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
    width: '100%', // Make button full width of the card
    backgroundColor: '#3498db', // Consistent primary button color
  },
  link: {
    marginTop: 15,
    marginBottom: 10,
  },
  linkText: {
    color: '#3498db', // Primary brand color for links
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#555',
    fontSize: 14,
  },
  signUpLink: {
    color: '#2ecc71', // A secondary brand color for signup
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});