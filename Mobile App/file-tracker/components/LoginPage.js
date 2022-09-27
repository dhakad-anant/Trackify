import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Button, TextInput, IconButton } from "react-native-paper";
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
      alert("Enter Valid Email");
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
      alert("Some error occurred!");
      setLoading(false);
      return 0;
    }

    if (error.error) {
      alert("Some error occurred!");
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
      alert("Some error occurred!");
      return 0;
    }
    if (error.error) {
      alert("Some error occurred!");
      return 0;
    }

    setTimeLeft(600);
  };

  const login = async () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("login", true);
    let match = null;
    try {
      match = await fetch(config.ip + "/verifyOTP", {
        method: "POST",
        body: formData,
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      match = await match.json();
    } catch (e) {
      alert("Some error occurred!");
      setLoading(false);
      return 0;
    }
    if (match.error) {
      alert("Some error occurred!");
      setLoading(false);
      return 0;
    }
    if (match.match) {
      setLoading(false);
      let offices = [];
      if (match.offices.length)
        offices = match.offices.split("$").map((x) => {
          return { office: x };
        });

      try {
        await AsyncStorage.setItem("@email", email);
        await AsyncStorage.setItem("@name", match.name);
        await AsyncStorage.setItem("@offices", JSON.stringify(offices));
        await AsyncStorage.setItem("recentSearch", JSON.stringify([]));
        if (offices.length) {
          await AsyncStorage.setItem("@office", offices[0].office);
        } else {
          await AsyncStorage.setItem("@office", "");
        }
        if (!match.profile) await AsyncStorage.setItem("@profile", "true");
      } catch (e) {
        alert(e);
        alert("Some error occurred!");
        await fetch(config.ip + "/logout", { method: "GET" });
      }

      setTimeout(() => {
        setEnterEmail(true);
        clearInterval(timeInterval);
        setTimeInterval(null);
        setTimeLeft(600);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: match.profile ? "MainApp" : "SetName",
            },
          ],
        });
      }, 200);

      return 0;
    }

    alert("Wrong OTP!");

    setLoading(false);

    return 0;
  };

  return (
    <ImageBackground
      style={{ flex: 1, height: 1.2 * windowHeight }}
      source={require("../assets/black_bg.jpg")}
      imageStyle={{ opacity: 0.9 }}
      resizeMode={"cover"}
    >
      <ScrollView keyboardShouldPersistTaps={"handled"}>
        {!enterEmail && (
          <IconButton
            icon="arrow-left"
            color="white"
            size={30}
            style={{
              position: "absolute",
              top: 1 * StatusBar.currentHeight,
              left: 4,
            }}
            onPress={() => {
              setEnterEmail(true);
              clearInterval(timeInterval);
              setTimeInterval(null);
              setTimeLeft(600);
            }}
          />
        )}

        <View
          style={{
            marginTop: "30%",
            alignItems: "center",
            padding: 8,
          }}
        >
          <Image
            style={{
              height: 0.4 * windowHeight,
              width: 0.2 * windowHeight,
              marginBottom: 0.08 * windowHeight,
            }}
            source={require("../assets/main_logo.png")}
          />

          {enterEmail && (
            <>
              <TextInput
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                style={{
                  marginTop: "-8%",
                  width: "80%",
                }}
                placeholder="Personal Email Address"
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
                color="white"
                style={{
                  justifyContent: "center",
                  borderColor: "white",
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
                    color: "white",
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
                    color: "white",
                  }}
                >
                  Time left:{" "}
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </Text>
              </View>

              <Button
                loading={loading}
                style={{
                  justifyContent: "center",
                  borderColor: "white",
                  borderWidth: 0.5,
                  marginTop: "4%",
                  width: "40%",
                }}
                mode="contained"
                color="white"
                onPress={loading ? () => {} : login}
              >
                Login
              </Button>
            </>
          )}
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#393C42" barStyle="light-content" />
    </ImageBackground>
  );
}
