import React, { useState, useEffect } from "react";
import { IconButton, Subheading, Button } from "react-native-paper";
import { View, ImageBackground, StatusBar, Modal } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import config from "../config";

export default function WebLogin(props) {
  // const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  // BarCodeScanner.requestPermissionsAsync();

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await BarCodeScanner.requestPermissionsAsync();
  //     setHasPermission(status === "granted");
  //   })();
  // }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    let url = config.ip + "/webapp/login/scan?qr=" + data;
    fetch(url, { method: "GET" })
      .then((response) => response.json())
      .then(({ success }) => {
        if (success) {
          alert("Logged in!");
          props.closeModal();
        } else alert("Error! Please try again.");
      })
      .catch(() => alert("Error! Please try again."));
  };

  return (
    <Modal
      animationType="slide"
      visible={true}
      useNativeDriver={true}
      animationIn="slideInLeft"
      animationOut="slideOutRight"
      onRequestClose={() => {
        props.closeModal();
      }}
    >
      <ImageBackground
        style={{ flex: 1, resizeMode: "cover" }}
        source={require("../assets/white_bg.png")}
        resizeMode={"cover"}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            paddingTop: "15%",
            paddingHorizontal: "5%",
          }}
        >
          {/* <IconButton
            icon="menu"
            color="black"
            size={30}
            style={{
              position: "absolute",
              top: 1 * StatusBar.currentHeight,
              left: 4,
            }}
            onPress={props.navigation.openDrawer}
          /> */}

          {/* {!hasPermission && (
            <Subheading style={{ color: "rgb(176, 1, 1)" }}>
              Camera permission not granted!
            </Subheading>
          )} */}
          {/* {hasPermission && ( */}
          <>
            <Subheading>Scan the QR code to login</Subheading>
            <BarCodeScanner
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{
                width: "100%",
                height: "80%",
                marginTop: "-10%",
              }}
            />
            {scanned && (
              <Button
                icon="replay"
                style={{
                  width: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "4%",
                  paddingVertical: "1%",
                }}
                mode="contained"
                color="black"
                onPress={() => setScanned(false)}
              >
                Scan again
              </Button>
            )}
          </>
          {/* )} */}
        </View>
      </ImageBackground>
    </Modal>
  );
}
