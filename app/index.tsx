import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import MainStyles from './StylingComponent/MainStyles';
import Login from './Registered/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './component/Home';

export default function index() {
  const [isLoggedIn, setIsLoggedIn] = useState("false");

  useEffect(() => {
    const check = async () => {
      const loggedin = await AsyncStorage.getItem("isLoggedIn");
      if (loggedin === "true") {
        setIsLoggedIn("true");
      }
    };
    check();
  }, []);

  return (
    <>
      <ScrollView style={MainStyles.body}>
        <View>
          {isLoggedIn === "true" ? <HomeScreen /> : <Login />}
        </View>
      </ScrollView>
    </>
  );
}