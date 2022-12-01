import React, { useState } from "react";
import {
  Avatar,
  Title,
  Caption,
  Drawer,
  TouchableRipple,
} from "react-native-paper";
import { View } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from "expo-barcode-scanner";
import config from "../config";
import WebLogin from "./WebLogin";

const DrawerContent = (props) => {
  const [user, setUser] = useState({
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE6XGQ9b93y4-wdN-oXWxQJuvWoLwbx5ChHQ&usqp=CAU",
    name: "",
    email: "",
    office: "",
  });
  const [login, setLogin] = useState(false);

  if (user.email.length == 0) {
    AsyncStorage.getItem("@email")
      .then(async (ret) => {
        if (ret == null) return 0;
        let name = await AsyncStorage.getItem("@name");
        let office = await AsyncStorage.getItem("@office");
        setUser((usr) => {
          usr.email = ret;
          usr.name = name;
          usr.office = office;
          return usr;
        });
      })
      .catch(() => alert("Some error occurred"));
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: "4%" }}>
            <View style={{ flexDirection: "row", marginTop: "8%" }} />
            <TouchableRipple
              onPress={() => {
                console.log("Profile");
              }}
              rippleColor="rgba(0, 0, 0, .15)"
              style={{ width: "100%" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: "4%",
                  marginLeft: "2%",
                }}
              >
                <Avatar.Image source={{ uri: user.image }} size={60} />
                <View style={{ marginLeft: "5%", flexDirection: "column" }}>
                  <Title
                    style={{
                      fontSize: 16,
                      marginTop: "2%",
                      fontWeight: "bold",
                    }}
                  >
                    {user.name}
                  </Title>
                  <Caption
                    style={{
                      fontSize: 14,
                      lineHeight: 14,
                    }}
                  >
                    {user.email}
                  </Caption>
                </View>
              </View>
            </TouchableRipple>
          </View>
          <Drawer.Section style={{ marginTop: "4%" }}>
            <DrawerItem
              icon={() => <Entypo name="home" size={22} color="black" />}
              label="Home"
              onPress={() => {
                props.navigation.navigate("Home");
              }}
            />
            <DrawerItem
              icon={() => (
                <FontAwesome name="history" size={24} color="black" />
              )}
              label="File history"
              onPress={() => {
                props.navigation.navigate("FileHistory");
              }}
            />
            <DrawerItem
              icon={() => (
                <FontAwesome name="exchange" size={20} color="black" />
              )}
              label="Pending Transfers"
              onPress={() => {
                props.navigation.navigate("ShowTransfers");
              }}
            />
            <DrawerItem
              icon={() => <FontAwesome name="plus" size={24} color="black" />}
              label="Add Office"
              onPress={() => {
                props.navigation.navigate("AddOffice");
              }}
            />
            <DrawerItem
              icon={() => <FontAwesome name="minus" size={24} color="black" />}
              label="Remove Office"
              onPress={() => {
                props.navigation.navigate("RemoveOffice");
              }}
            />
            <DrawerItem
              icon={() => <Entypo name="laptop" size={20} color="black" />}
              label="Trackify Web"
              onPress={async () => {
                // props.navigation.navigate("WebLogin");
                const {
                  status,
                } = await BarCodeScanner.requestPermissionsAsync();
                setLogin(status === "granted");
              }}
            />
            {/* <DrawerItem
              icon={() => (
                <MaterialIcons name="feedback" size={24} color="black" />
              )}
              label="Feedback"
              onPress={() => {
                props.navigation.navigate("Feedback");
              }}
            />
            <DrawerItem
              icon={() => (
                <FontAwesome5 name="info-circle" size={24} color="black" />
              )}
              label="Info"
              onPress={() => {
                // props.navigation.navigate("NewFile");
              }}
            /> */}
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>

      <Drawer.Section
        style={{
          marginBottom: "8%",
          borderTopColor: "#f4f4f4",
          borderTopWidth: 1,
        }}
      >
        <DrawerItem
          icon={() => <MaterialIcons name="logout" size={24} color="black" />}
          label="Sign Out"
          onPress={async () => {
            console.log("Logout");
            try {
              await fetch(config.ip + "/logout", { method: "GET" });
              await AsyncStorage.removeItem("@email");
              await AsyncStorage.removeItem("@profile");
              await AsyncStorage.removeItem("@offices");
              await AsyncStorage.removeItem("@office");
              await AsyncStorage.removeItem("@name");
              props.navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "LoginPage",
                  },
                ],
              });
            } catch (e) {
              alert(e);
              // alert("Could not signout");
            }
          }}
        />
      </Drawer.Section>
      {login && <WebLogin closeModal={() => setLogin(false)} />}
    </View>
  );
};

export default DrawerContent;
