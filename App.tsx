/* eslint-disable react-native/no-inline-styles */
//refer to react navigation site, implement the correct usage of the navigation function
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, { useContext } from 'react'; // Added useEffect and useState
import { View, StatusBar, StyleSheet } from 'react-native'; // Added ActivityIndicator and Text
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
//import AsyncStorage from '@react-native-async-storage/async-storage'; // Added AsyncStorage
import { AuthProvider, AuthContext } from './src/context/AuthContext'; // Adjust path based on where you put AuthContext.js


enableScreens();

// Import all your screens
import TenantLoginScreen from './src/screens/auth/Tenant/Login/index';
import LandingPage from './src/screens/auth/LandingPage/index';
import TenantSignupScreen from './src/screens/auth/Tenant/Signup/index';
import LandlordLoginScreen from './src/screens/auth/Landlord/Signin/index';
import LandlordSignupScreen from './src/screens/auth/Landlord/Signup/index';
import LogoutScreen from './src/screens/auth/Logout/logOut';
import TenantDashboardScreen from './src/screens/app/TenantDB/index';
import MessagesScreen from './src/screens/app/Messages/index';
import MaintenanceRequestsScreen from './src/screens/app/Messages/Maintainance/index';
import MyLeasesScreen from './src/screens/app/TenantDB/Mylease/index';
import PropertyDashboard from './src/screens/app/Properties/index';
import PropertyDetailsScreen from './src/screens/app/Properties/PropertiesDetails/index';
import LandlordDashboardScreen from './src/screens/app/LandlordDB/index';
import AddPropertyScreen from './src/screens/app/LandlordDB/AddProperties/index';
import LandlordPropertiesScreen from './src/screens/app/LandlordDB/LandlordPropertiesScreen/index';
import LandlordMessagesScreen from './src/screens/app/LandlordDB/LandlordMessage/index';
import ChatScreen from './src/screens/app/LandlordDB/LandlordMessage/ChatScreen/index';
import AdminDashboardScreen from './src/screens/app/Admin/index';
import AdminPropertiesScreen from './src/screens/app/Admin/allProperties/index';
import AdminPropertyDetailsScreen from './src/screens/app/Admin/propertiesDetails/index';
import SettingsScreen from './src/screens/app/settings/index'

const Stack = createStackNavigator();

const RootNavigator = () => {

  const { userToken, userRole } = useContext(AuthContext); // Get auth state from context

  return (<Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken == null ? (
              // No token found, show authentication screens
              <Stack.Group>
                <Stack.Screen name="Landing" component={LandingPage} />
                <Stack.Screen name="TenantLogin" component={TenantLoginScreen} />
                <Stack.Screen name="TenantSignup" component={TenantSignupScreen} />
                <Stack.Screen name="LandlordLogin" component={LandlordLoginScreen} />
                <Stack.Screen name="LandlordSignup" component={LandlordSignupScreen} />
              </Stack.Group>
            ) : (
              // Token found, show main application screens based on role
              <Stack.Group>
                {userRole === 'tenant' && (
                  <Stack.Screen name="TenantDashboardScreen" component={TenantDashboardScreen} />
                )}
                {userRole === 'landlord' && (
                  <Stack.Screen name="LandlordDashboardScreen" component={LandlordDashboardScreen} />
                )}
                 {userRole === 'admin' && (
                  <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
                )}

                <Stack.Screen name="Logout" component={LogoutScreen} />
                {/* Common app screens accessible after login, regardless of role */}
                <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
                <Stack.Screen name="MaintenanceRequestsScreen" component={MaintenanceRequestsScreen} />
                <Stack.Screen name="MyLeasesScreen" component={MyLeasesScreen} />
                <Stack.Screen name="PropertyDashboard" component={PropertyDashboard} />
                <Stack.Screen name="PropertyDetailsScreen" component={PropertyDetailsScreen} />
                <Stack.Screen name="AddPropertyScreen" component={AddPropertyScreen}/>
                <Stack.Screen name="LandlordPropertiesScreen" component={LandlordPropertiesScreen} />
                <Stack.Screen name="LandlordMessagesScreen" component={LandlordMessagesScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="AdminPropertiesScreen" component={AdminPropertiesScreen}/>
                <Stack.Screen name="AdminPropertyDetailsScreen" component={AdminPropertyDetailsScreen}/>
                <Stack.Screen name="SettingScreen"component={SettingsScreen}/>

                {/* Fallback if role is not recognized or not yet set, or if trying to navigate to a screen not explicitly defined above
                   This screen acts as the 'initial' screen for the authenticated flow.
                   If you want a specific dashboard to be the default after login,
                   you could uncomment and set initialRouteName here for the Stack.Group,
                   but it's better handled by the conditional rendering above.
                */}
                 {/* <Stack.Screen name="FallbackAppScreen" component={TenantDashboardScreen} /> */}
              </Stack.Group>
            )}
          </Stack.Navigator>
  );
};
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          animated={true}
          backgroundColor="transparent"
          barStyle="light-content"
          translucent={true}
        />
        <NavigationContainer>
          <AuthProvider>
            <RootNavigator /> {/* Render the RootNavigator inside the AuthProvider */}
          </AuthProvider>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the root view takes full height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5', // Light background for loading
  },
});

export default App;