import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Title,
  TextInput,
  IconButton,
  Provider,
  Caption,
} from "react-native-paper";
import {
  View,
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Search from "./Search";
import config from "../config";

const FileAction = (props) => {
  const [remarks, setRemarks] = useState("");
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [officeMenuVisible, setOfficeMenuVisible] = useState(false);
  const [forwardingTo, setForwardingTo] = useState("");
  const [action, setAction] = useState("");
  const [errors, setErrors] = useState([undefined, undefined, undefined]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [file, setFile] = useState({
    token: props.token,
    name: props.name,
  });

  const openActionMenu = () => setActionMenuVisible(true);
  const closeActionMenu = () => setActionMenuVisible(false);
  const openOfficeMenu = () => setOfficeMenuVisible(true);
  const closeOfficeMenu = () => setOfficeMenuVisible(false);
  const validateForm = () => {
    var newErrors = [undefined, undefined, undefined];
    let ret = true;
    if (action === "") {
      ret = false;
      newErrors[0] = "Please select an action";
    }
    if (action === "Processed & Forwarded" && forwardingTo === "") {
      ret = false;
      newErrors[1] = "Please select who you are forwarding to";
    }
    setErrors(newErrors);
    return ret;
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
    <Modal
      animationType="slide"
      visible={props.showModal}
      useNativeDriver={true}
      animationIn="slideInLeft"
      animationOut="slideOutRight"
      onRequestClose={() => props.closeModal()}
    >
      <Provider>
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
            <View style={{ backgroundColor: "transparent", height: "100%" }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  justifyContent: "center",
                  paddingLeft: "8%",
                  // marginTop: "0%",
                }}
              >
                {!isKeyboardVisible && (
                  <IconButton
                    icon="arrow-left"
                    color="black"
                    size={30}
                    style={{
                      position: "absolute",
                      top: 1 * StatusBar.currentHeight,
                      left: 4,
                    }}
                    onPress={props.closeModal}
                  />
                )}
                <Title style={{ fontSize: 30, flexWrap: "wrap" }}>
                  {file.name}
                </Title>
                <Caption style={{ fontSize: 14 }}>
                  Tracking ID: {file.token}
                </Caption>

                <Pressable onPress={openActionMenu} style={{ width: "70%" }}>
                  <TextInput
                    label="Action"
                    value={action}
                    mode="outlined"
                    style={{
                      marginTop: "6%",
                    }}
                    theme={{
                      colors: {
                        primary: "black",
                        underlineColor: "transparent",
                      },
                    }}
                    editable={false}
                    right={
                      <TextInput.Icon
                        name="chevron-right"
                        onPress={openActionMenu}
                      />
                    }
                  />
                </Pressable>
                <Search
                  searchFor="fileActions"
                  showModal={actionMenuVisible}
                  closeModal={closeActionMenu}
                  setOption={setAction}
                />
                {errors[0] && (
                  <Text
                    style={{
                      color: "rgb(176, 1, 1)",
                      marginTop: "1%",
                      marginLeft: "1%",
                    }}
                  >
                    {errors[0]}
                  </Text>
                )}
                <Pressable
                  onPress={action === "Forward" ? openOfficeMenu : null}
                  style={{ width: "70%" }}
                >
                  <TextInput
                    label="Forwarding to"
                    value={forwardingTo}
                    mode="outlined"
                    style={{
                      marginTop: "3%",
                    }}
                    theme={{
                      colors: {
                        primary: "black",
                        underlineColor: "transparent",
                      },
                    }}
                    editable={false}
                    disabled={
                      action == "Processed & Forwarded" ||
                      action == "Clarifications/Inputs needed"
                        ? false
                        : true
                    }
                    right={
                      <TextInput.Icon
                        name="chevron-right"
                        onPress={
                          action == "Processed & Forwarded" ||
                          action == "Clarifications/Inputs needed"
                            ? openOfficeMenu
                            : null
                        }
                      />
                    }
                  />
                </Pressable>
                <Search
                  searchFor="offices"
                  showModal={officeMenuVisible}
                  closeModal={closeOfficeMenu}
                  setOption={setForwardingTo}
                />
                {errors[1] && (
                  <Text
                    style={{
                      color: "rgb(176, 1, 1)",
                      marginTop: "1%",
                      marginLeft: "1%",
                    }}
                  >
                    {errors[1]}
                  </Text>
                )}
                <TextInput
                  label="Remarks"
                  value={remarks}
                  maxLength={40}
                  onChangeText={(remarks) => setRemarks(remarks)}
                  mode="outlined"
                  selectionColor="rgba(0, 0, 0, 0.2)"
                  style={{
                    width: "70%",
                    marginTop: "2%",
                  }}
                  theme={{
                    colors: {
                      primary: "black",
                      underlineColor: "transparent",
                    },
                  }}
                />
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
                  onPress={async () => {
                    if (validateForm()) {
                      try {
                        let recents = await AsyncStorage.getItem(
                          "recentSearch"
                        );
                        recents = JSON.parse(recents);
                        if (!recents.includes(props.office))
                          recents.push(props.office);
                        recents = recents.slice(-10);
                        AsyncStorage.setItem(
                          "recentSearch",
                          JSON.stringify(recents)
                        );
                      } catch (e) {
                        alert("Local storage error!");
                      }

                      let type = -1;
                      if (action == "Processed") type = 0;
                      if (action == "Processed & Forwarded") type = 1;
                      if (action == "Clarifications/Inputs needed") type = 2;
                      if (action == "Approved and Returned Finally") type = 3;
                      if (action == "Approved and Kept Finally") type = 4;
                      if (action == "Not Approved and Returned Finally")
                        type = 5;
                      if (action == "Not Approved and Kept Finally") type = 6;
                      let next = "";
                      if (type == 1 || type == 2) {
                        next = forwardingTo;
                      }
                      let formData = new FormData();
                      formData.append("tag", props.token);
                      formData.append("type", type);
                      formData.append("next", next);
                      formData.append("office", props.office);
                      formData.append("remarks", remarks);
                      fetch(config.ip + "/updateFile", {
                        method: "POST",
                        body: formData,
                        headers: {
                          "content-type": "multipart/form-data",
                        },
                      })
                        .then(async (ret) => {
                          ret = await ret.json();
                          if (ret.error == false) {
                            props.onSuccess();
                          } else {
                            alert("Something went wrong!");
                          }
                        })
                        .catch(() => alert("Could not update file!"));
                    }
                  }}
                >
                  Confirm
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </Provider>
    </Modal>
  );
};

export default FileAction;
