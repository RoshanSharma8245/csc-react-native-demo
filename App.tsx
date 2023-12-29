import React from 'react';
import { View, StyleSheet, LogBox } from 'react-native';

LogBox.ignoreAllLogs();


import LoginScreen from './src/screen/LoginScreen';
import ContentScreen from './src/screen/ContentScreen';


//PACKAGES
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ConscentWebView } from 'csc-react-native-sdk';

const Stack = createStackNavigator();

const App = props => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ContentScreen" component={ContentScreen} />
        <Stack.Screen name="ConscentWebView" component={ConscentWebView} 
        options={{
          headerShown: false
        }}/>      
      </Stack.Navigator>
    </NavigationContainer>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
  },
});

export default App;
