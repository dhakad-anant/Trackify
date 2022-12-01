import React, { useState, useEffect } from "react";
import {
  Keyboard,
  View,
  ImageBackground,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import Search from "./Search";
import { Button, TextInput, Title, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

export default function SetName({ navigation }, prop) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <ImageBackground
      style={{ flex: 1, resizeMode: "cover" }}
      source={require("../assets/white_bg.png")}
      imageStyle={{ opacity: 0.5 }}
      resizeMode={"cover"}
    >
      <TouchableWithoutFeedback
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
        onPress={() => {
          Keyboard.dismiss();
        }}
        accessible={false}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <View style={{ width: "80%", alignItems: "center" }}>
            <Title style={{ fontSize: 20, flexWrap: "wrap" }}>
              What should we call you?
            </Title>
          </View>
          <TextInput
            value={name}
            mode="outlined"
            label="Enter your name"
            autoCompleteType="name"
            textContentType="name"
            onChangeText={(t) => {
              setName(t);
            }}
            style={{
              width: "70%",
              marginTop: "2.5%",
            }}
            theme={{
              colors: {
                primary: "black",
                underlineColor: "transparent",
              },
            }}
            selectionColor="rgba(0, 0, 0, 0.2)"
            maxLength={30}
          />
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={{ width: "70%" }}
          >
            <TextInput
              value={dept}
              mode="outlined"
              label="Enter your Department"
              style={{
                width: "100%",
                marginTop: "1%",
              }}
              theme={{
                colors: {
                  primary: "black",
                  underlineColor: "transparent",
                },
              }}
              selectionColor="rgba(0, 0, 0, 0.2)"
              editable={false}
              right={
                <TextInput.Icon
                  name="chevron-down"
                  onPress={() => setMenuVisible(true)}
                />
              }
            />
          </Pressable>
          <Search
            searchFor="depts"
            showModal={menuVisible}
            closeModal={() => setMenuVisible(false)}
            setOption={setDept}
          />
          {error && (
            <Text
              style={{
                color: "rgb(176, 1, 1)",
                marginTop: "1%",
                marginLeft: "1%",
              }}
            >
              {error}
            </Text>
          )}
          <Button
            icon="check"
            style={{
              width: "40%",
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              marginTop: "5%",
              paddingVertical: "1%",
            }}
            mode="contained"
            color="black"
            onPress={() => {
              if (name.length == 0) {
                setError("Please enter your name");
                return;
              }
              if (dept.length == 0) {
                setError("Please select a department");
                return;
              }
              let formData = new FormData();
              formData.append("name", name);
              formData.append("dept", dept);
              fetch(config.ip + "/setName", {
                method: "POST",
                body: formData,
                headers: {
                  "content-type": "multipart/form-data",
                },
              })
                .then(async () => {
                  await AsyncStorage.removeItem("@profile");
                  await AsyncStorage.setItem("@name", name);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                  });
                })
                .catch((e) => {
                  alert("Error");
                });
            }}
          >
            {" "}
            Confirm
          </Button>
        </View>
        {/* <DropdownAlert ref={(r) => setDropDown(r)} /> */}
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}
