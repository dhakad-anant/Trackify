import React, { useState, useEffect } from "react";
import { View, ImageBackground, StatusBar, Modal } from "react-native";
import Capture from "./Capture";
import { Button, TextInput, Subheading, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import config from "../config";

export default function ScanToken(props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [subheading, setSubheading] = useState(
    "Click a clear picture of the token."
  );

  useEffect(() => {
    if (attempt > 1) setSubheading("Try again or type the token instead!");
  });

  return (
    <Modal
      animationType="slide"
      visible={props.showModal}
      useNativeDriver={true}
      animationIn="slideInLeft"
      animationOut="slideOutRight"
      onRequestClose={props.closeModal}
    >
      <ImageBackground
        style={{ flex: 1, resizeMode: "cover" }}
        source={require("../assets/white_bg.png")}
        imageStyle={{ opacity: 1 }}
        resizeMode={"cover"} // cover or contain its upto you view look
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            paddingTop: "5%",
          }}
        >
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
          <Subheading
            style={{ color: attempt > 1 ? "rgb(176, 1, 1)" : "black" }}
          >
            {subheading}
          </Subheading>

          <View
            style={{
              height: "60%",
              width: "80%",
              marginTop: "4%",
              backgroundColor: "transparent",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <Capture
              onSubmit={(image) => {
                setLoading(true);
                var name = image.uri.split("/").pop();
                let formData = new FormData();
                formData.append("image", {
                  uri: image.uri,
                  name: name,
                  type: "image/jpg",
                });
                fetch(config.ip + "/scan", {
                  method: "POST",
                  body: formData,
                  headers: {
                    "content-type": "multipart/form-data",
                  },
                })
                  .then((ret) => {
                    ret
                      .json()
                      .then((data) => {
                        setToken(String(data.id));
                        setLoading(false);
                      })
                      .catch((err) => {
                        setAttempt(attempt + 1);
                        alert("Try again!");
                        setLoading(false);
                      });
                  })
                  .catch((ret) => {
                    alert("Network Error!");
                    setLoading(false);
                  });
              }}
            ></Capture>
          </View>
          <View
            style={{
              height: "10%",
              paddingTop: "4%",
              width: "70%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <TextInput
                label="Token number"
                value={token}
                onChangeText={(token) => setToken(token)}
                mode="outlined"
                selectionColor="rgba(0, 0, 0, 0.2)"
                style={{
                  width: "70%",
                }}
                theme={{
                  colors: { primary: "black", underlineColor: "transparent" },
                }}
              />
              <Button
                loading={loading}
                disabled={token.length == 0}
                style={{
                  width: "0%",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "2.5%",
                  marginLeft: 10,
                  // paddingLeft: "5%",
                }}
                // icon="check"
                mode="contained"
                color="black"
                onPress={
                  loading
                    ? null
                    : () => {
                        console.log("Send to server");
                        props.onSubmit(token);
                        props.closeModal();
                      }
                }
              >
                {!loading && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </Button>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Modal>
  );
}
