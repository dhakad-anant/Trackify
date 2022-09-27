import React, { useState } from "react";
import {
  Text,
  View,
  Dimensions,
  ScrollView,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Button, TextInput, IconButton, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enterEmail, setEnterEmail] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeInterval, setTimeInterval] = useState(null);
  const [otp, setOTP] = useState("");

  const generateOTP = async () => {
    if (!/^[a-zA-Z0-9+_\.-]+@[a-zA-Z0-9\.-]+\.[a-zA-Z]+$/.test(email)) {
      alert("Enter valid email address");
      return 0;
    }
    setLoading(true);
    let formData = new FormData();
    formData.append("email", email);
    let error = null;
    try {
      error = await fetch(config.ip + "/generateOTP", {
        method: "POST",
        body: formData,
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      error = await error.json();
    } catch (e) {
      alert("Some error occurred");
      setLoading(false);
      return 0;
    }

    if (error.error) {
      alert("Some error occurred");
      setLoading(false);
      return 0;
    }

    setLoading(false);
    setEnterEmail(false);

    setTimeInterval(
      setInterval(() => {
        setTimeLeft((prevtimeLeft) => {
          if (prevtimeLeft == 1) {
            setEnterEmail(true);
          }
          return prevtimeLeft - 1;
        });
      }, 1000)
    );
  };

  const resendOTP = async () => {
    let formData = new FormData();
    formData.append("email", email);
    let error = null;
    try {
      error = await fetch(config.ip + "/generateOTP", {
        method: "POST",
        body: formData,
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      error = await error.json();
    } catch (e) {
      alert("Some error occurred");
      return 0;
    }
    if (error.error) {
      alert("Some error occurred");
      return 0;
    }
    setTimeLeft(600);
  };

  const addOffice = async () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("addoffice", true);

    let ret = await fetch(config.ip + "/verifyOTP", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
    });

    setLoading(false);

    ret = await ret.json();

    if (ret.error) {
      alert("Something's not right! Make sure it is an office email account!");
      return 0;
    }
    if (!ret.match) {
      alert("Wrong OTP!");
      return 0;
    }

    let offices = [];
    if (ret.offices.length)
      offices = ret.offices.split("$").map((x) => {
        return { office: x };
      });

    await AsyncStorage.setItem("@offices", JSON.stringify(offices));

    if (offices.length == 1) {
      await AsyncStorage.setItem("@office", offices[0].office);
    }
    setEnterEmail(true);
    alert("Office added successfully!");

    setTimeout(
      () =>
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Home",
            },
          ],
        }),
      500
    );
  };

  return (
    <ImageBackground
      style={{ flex: 1, height: 1.2 * windowHeight }}
      source={require("../assets/white_bg.png")}
      imageStyle={{ opacity: 0.9 }}
      resizeMode={"cover"}
    >
      <ScrollView
        keyboardShouldPersistTaps={"handled"}
        style={{ heigth: "100%" }}
      >
        <IconButton
          icon="menu"
          color="black"
          size={30}
          style={{
            position: "absolute",
            top: 1 * StatusBar.currentHeight,
            left: 4,
          }}
          onPress={
            enterEmail
              ? navigation.openDrawer
              : () => {
                  setEnterEmail(true);
                  clearInterval(timeInterval);
                  setTimeInterval(null);
                  setTimeLeft(600);
                }
          }
        />

        <View
          style={{
            alignItems: "center",
            marginTop: "50%",
            padding: 8,
          }}
        >
          <Title
            style={{
              fontSize: 30,
              marginBottom: "20%",
            }}
          >
            Add Office Email
          </Title>

          {enterEmail && (
            <>
              <TextInput
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                style={{
                  width: "80%",
                }}
                placeholder="Registered Office Email Address"
                mode="outlined"
                theme={{
                  colors: {
                    primary: "black",
                    underlineColor: "transparent",
                  },
                }}
                onChangeText={(txt) => {
                  setEmail(txt);
                }}
                value={email}
              />

              <Button
                loading={loading}
                color="black"
                style={{
                  justifyContent: "center",
                  borderColor: "white",
                  paddingVertical: "1%",
                  borderWidth: 0.5,
                  marginTop: "4%",
                  width: "40%",
                }}
                mode="contained"
                onPress={loading ? () => {} : generateOTP}
              >
                Get OTP
              </Button>
            </>
          )}

          {!enterEmail && (
            <>
              <TextInput
                onChangeText={(txt) => setOTP(txt)}
                keyboardType="numeric"
                style={{
                  marginTop: "-8%",
                  width: "80%",
                }}
                placeholder="Enter OTP"
                mode="outlined"
                theme={{
                  colors: {
                    primary: "black",
                    underlineColor: "transparent",
                  },
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginLeft: "-3.5%",
                }}
              >
                <Button
                  icon="reload"
                  labelStyle={{
                    fontSize: 0.0340909091 * windowWidth,
                    color: "black",
                  }}
                  onPress={resendOTP}
                >
                  Resend
                </Button>
                <Text
                  style={{
                    fontSize: 0.0351909091 * windowWidth,
                    marginTop: 0.0107913669 * windowHeight,
                    marginLeft: 0.204545455 * windowWidth,
                    marginLeft: "22%",
                    color: "black",
                  }}
                >
                  Time left:{" "}
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </Text>
              </View>

              <Button
                loading={loading}
                color="black"
                style={{
                  justifyContent: "center",
                  borderColor: "white",
                  paddingVertical: "1%",
                  borderWidth: 0.5,
                  marginTop: "4%",
                  width: "40%",
                }}
                mode="contained"
                onPress={loading ? () => {} : addOffice}
              >
                Add Office
              </Button>
            </>
          )}
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#393C42" barStyle="light-content" />
    </ImageBackground>
  );
}
