import React, { useState, useEffect } from "react";
import { Button, Text, Title, TextInput, IconButton } from "react-native-paper";
import {
  View,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Feedback = (props) => {
  const [text, setText] = useState("");
  const [error, setError] = useState(undefined);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const validateForm = () => {
    var newError = undefined;
    if (text === "") newError = "Please enter some text";
    setError(newError);
  };

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
      resizeMode={"cover"} // cover or contain its upto you view look
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
        <View style={{ backgroundColor: "transparent", height: "100%" }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              justifyContent: "center",
              paddingLeft: "8%",
            }}
          >
            {!isKeyboardVisible && (
              <IconButton
                icon="menu"
                color="black"
                size={30}
                style={{
                  position: "absolute",
                  top: 1 * StatusBar.currentHeight,
                  left: 4,
                }}
                onPress={props.navigation.openDrawer}
              />
            )}
            <Title style={{ fontSize: 30, flexWrap: "wrap" }}>
              We're all ears{" "}
              <Ionicons name="ear-outline" size={26} color="black" />
            </Title>
            <TextInput
              label="Feedback"
              textAlignVertical={"top"}
              value={text}
              maxLength={200}
              multiline={true}
              numberOfLines={7}
              onChangeText={(text) => setText(text)}
              mode="outlined"
              selectionColor="rgba(0, 0, 0, 0.2)"
              style={{
                width: "80%",
                marginTop: "3%",
              }}
              theme={{
                colors: {
                  primary: "black",
                  underlineColor: "transparent",
                },
              }}
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
                validateForm();
              }}
            >
              Send
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default Feedback;
