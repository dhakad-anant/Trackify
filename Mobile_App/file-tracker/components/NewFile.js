import React, { useState, useEffect } from "react";
import Search from "./Search";
import WriteToken from "./WriteToken";
import {
  Button,
  Text,
  Title,
  TextInput,
  IconButton,
  Provider,
} from "react-native-paper";
import {
  View,
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const NewFile = (props) => {
  const [name, setName] = useState("");
  const [officeMenuVisible, setOfficeMenuVisible] = useState(false);
  const [transferMenuVisible, setTransferMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [fileType, setFileType] = useState("");
  const [tag, setTag] = useState(null);
  const [submittedTo, setSubmittedTo] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [errors, setErrors] = useState([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const openOfficeMenu = () => setOfficeMenuVisible(true);
  const closeOfficeMenu = () => setOfficeMenuVisible(false);
  const openTransferMenu = () => setTransferMenuVisible(true);
  const closeTransferMenu = () => setTransferMenuVisible(false);
  const openTypeMenu = () => setTypeMenuVisible(true);
  const closeTypeMenu = () => setTypeMenuVisible(false);
  const validateForm = () => {
    var newErrors = [undefined, undefined, undefined];
    let ret = true;
    if (name === "") {
      newErrors[0] = "Please enter a file name";
      ret = false;
    }
    if (fileType === "") {
      newErrors[1] = "Please select a file type";
      ret = false;
    }
    if (submittedTo === "") {
      newErrors[2] = "Please select an office";
      ret = false;
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
                  onPress={() => {
                    props.navigation.goBack();
                  }}
                />
              )}
              <Title
                style={{ fontSize: 30, flexWrap: "wrap", marginTop: "8%" }}
              >
                Create new file
              </Title>
              <TextInput
                label="Name (Required)"
                value={name}
                maxLength={20}
                onChangeText={(name) => setName(name)}
                mode="outlined"
                selectionColor="rgba(0, 0, 0, 0.2)"
                style={{
                  width: "70%",
                  marginTop: "4%",
                }}
                theme={{
                  colors: {
                    primary: "black",
                    underlineColor: "transparent",
                  },
                }}
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
              <Pressable onPress={openTypeMenu} style={{ width: "70%" }}>
                <TextInput
                  label="File type (Required)"
                  value={fileType}
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
                  right={
                    <TextInput.Icon
                      name="chevron-right"
                      onPress={openTypeMenu}
                    />
                  }
                />
              </Pressable>
              <Search
                searchFor="fileTypes"
                showModal={typeMenuVisible}
                closeModal={closeTypeMenu}
                setOption={setFileType}
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
              <Pressable onPress={openOfficeMenu} style={{ width: "70%" }}>
                <TextInput
                  label="Submitted to (Required)"
                  value={submittedTo}
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
                  right={
                    <TextInput.Icon
                      name="chevron-right"
                      onPress={openOfficeMenu}
                    />
                  }
                />
              </Pressable>
              <Search
                searchFor="offices"
                showModal={officeMenuVisible}
                closeModal={closeOfficeMenu}
                setOption={setSubmittedTo}
              />
              {errors[2] && (
                <Text
                  style={{
                    color: "rgb(176, 1, 1)",
                    marginTop: "1%",
                    marginLeft: "1%",
                  }}
                >
                  {errors[2]}
                </Text>
              )}
              <Pressable onPress={openTransferMenu} style={{ width: "70%" }}>
                <TextInput
                  label="Transfer ownership"
                  value={transferTo}
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
                  right={
                    <TextInput.Icon
                      name="chevron-right"
                      onPress={openTransferMenu}
                    />
                  }
                />
              </Pressable>
              <Search
                searchFor="users"
                showModal={transferMenuVisible}
                closeModal={closeTransferMenu}
                setOption={setTransferTo}
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
                      let recents = await AsyncStorage.getItem("recentSearch");
                      recents = JSON.parse(recents);
                      if (!recents.includes(submittedTo))
                        recents.push(submittedTo);
                      // if (transferTo !== "") recents.push(transferTo);
                      recents = recents.slice(-10);
                      AsyncStorage.setItem(
                        "recentSearch",
                        JSON.stringify(recents)
                      );
                    } catch (e) {
                      console.log(e);
                      alert("Local storage error!");
                    }
                    // return;
                    formData = new FormData();
                    formData.append("name", name);
                    formData.append("type", fileType);
                    formData.append("submitted_to", submittedTo);
                    if (transferTo) {
                      formData.append("transfer_to", transferTo);
                    }
                    fetch(config.ip + "/createFile", {
                      method: "POST",
                      body: formData,
                      headers: {
                        "content-type": "multipart/form-data",
                      },
                    })
                      .then(async (ret) => {
                        ret = await ret.json();
                        if (!ret.tag) {
                          alert("Could not create file!");
                          return 0;
                        } else {
                          setTag(ret.tag);
                        }
                      })
                      .catch(() => alert("Check Network Connection!"));
                  }
                }}
              >
                Confirm
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
      <WriteToken
        showModal={tag != null}
        token={tag}
        navigation={props.navigation}
        closeModal={() => {
          setTag(null);
        }}
      />
    </Provider>
  );
};

export default NewFile;
