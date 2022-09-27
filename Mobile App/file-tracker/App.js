import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage.js";
import Landing from "./components/Landing.js";
import SetName from "./components/SetName.js";
import AddOffice from "./components/AddOffice";
import RemoveOffice from "./components/RemoveOffice";
import NewFile from "./components/NewFile";
import DrawerContent from "./components/DrawerContent";
import WebLogin from "./components/WebLogin";
import FileHistory from "./components/FileHistory";
import ShowTransfers from "./components/ShowTransfers";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from './config';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainApp(props) {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={Landing} />
      <Drawer.Screen name="FileHistory" component={FileHistory} />
      <Drawer.Screen name="ShowTransfers" component={ShowTransfers} />
      <Drawer.Screen name="NewFile" component={NewFile} />
      <Drawer.Screen name="AddOffice" component={AddOffice} />
      <Drawer.Screen name="RemoveOffice" component={RemoveOffice} />
      {/* <Drawer.Screen name="WebLogin" component={WebLogin} /> */}
    </Drawer.Navigator>
  );
}

async function readLocal(setEmail, setProfile) {
  try {
    let email = await AsyncStorage.getItem("@email");
    let profile = await AsyncStorage.getItem("@profile");
    try{
      let ret = await fetch(
        config.ip + "/getMyOffices",
        { method: "GET" }
      );
      ret = await ret.json();

      let offices = [];
      if (ret.offices.length)
        offices = ret.offices.split("$").map((x) => {
          return { office: x };
        });

      await AsyncStorage.setItem("@offices", JSON.stringify(offices));
      
      let office = await AsyncStorage.getItem("@office");

      if(!offices.includes(office)){
        if (offices.length) {
          await AsyncStorage.setItem("@office", offices[0].office);
        } else {
          await AsyncStorage.setItem("@office", "");
        }
      }
    }catch(e){
      console.log(e);
    }

    if (email == null) setEmail(false);
    else setEmail(email);
    if (profile == null) setProfile(false);
    else setProfile(profile);
  } catch (e) {
    alert("Could not open app ;(");
  }
}

export default function App() {
  const [email, setEmail] = useState(null);
  const [profile, setProfile] = useState(null);

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    if (email != null && profile != null) SplashScreen.hideAsync();
  });

  readLocal(setEmail, setProfile);

  return (
    <NavigationContainer>
      {email != null && profile != null && (
        <Stack.Navigator
          initialRouteName={
            email ? (profile ? "SetName" : "MainApp") : "LoginPage"
          }
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MainApp" component={MainApp} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="SetName" component={SetName} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
