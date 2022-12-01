import React, { useState, useEffect } from "react";
import {
  Title,
  Subheading,
  IconButton,
  TouchableRipple,
  Button,
} from "react-native-paper";
import { View, ImageBackground, StatusBar, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const RemoveOffice = (props) => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState({});

  const removeOffice = async (office) => {
    setLoading((load) => {
      load = JSON.parse(JSON.stringify(load));
      load[office] = true;
      return load;
    });
    let ret = await fetch(config.ip + "/removeOffice?office=" + office);
    ret = await ret.json();
    if (ret.error) {
      alert("Could not remove office!");
      setLoading((load) => {
        load = JSON.parse(JSON.stringify(load));
        load[office] = false;
        return load;
      });
      return 0;
    }
    ret = offices.filter((x) => x.office != office);
    setOffices(ret);
    await AsyncStorage.setItem("@offices", JSON.stringify(ret));
    if (ret.length > 0) await AsyncStorage.setItem("@office", ret[0].office);
    else await AsyncStorage.setItem("@office", "");
  };

  if (offices.length == 0) {
    AsyncStorage.getItem("@offices")
      .then((ret) => {
        if (ret == null) return 0;
        setOffices(JSON.parse(ret));
      })
      .catch((e) => alert(e));
  }

  return (
    <ImageBackground
      style={{ flex: 1, resizeMode: "cover" }}
      source={require("../assets/white_bg.png")}
      imageStyle={{ opacity: 0.5 }}
      resizeMode={"cover"}
    >
      <View style={{ backgroundColor: "transparent", height: "100%" }}>
        <IconButton
          icon="menu"
          color="black"
          size={30}
          style={{
            position: "absolute",
            top: 1 * StatusBar.currentHeight,
            left: 4,
          }}
          onPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            justifyContent: "center",
            marginTop: 3.5 * StatusBar.currentHeight,
          }}
        >
          <Title
            style={{
              marginLeft: "1%",
              fontSize: 30,
              flexWrap: "wrap",
              marginLeft: "8%",
            }}
          >
            Offices
          </Title>
          <ScrollView
            style={{
              width: "100%",
              marginTop: "3%",
            }}
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: "10%",
            }}
          >
            <View style={{ width: "100%", alignItems: "center" }}>
              {offices.length === 0 && (
                <Subheading style={{ marginTop: "4%" }}>
                  No offices added!
                </Subheading>
              )}

              {offices.map((office, idx) => {
                return (
                  <View
                    style={{
                      width: "85%",
                      height: 70,
                      borderColor: "black",
                      borderWidth: 1,
                      borderRadius: 10,
                      marginTop: idx === 0 ? "1.25%" : "4%",
                      overflow: "hidden",
                    }}
                    key={office.office}
                  >
                    <TouchableRipple
                      onPress={() => {}}
                      rippleColor="rgba(0, 0, 0, .15)"
                      style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={{
                            paddingVertical: "2%",
                            paddingLeft: "5%",
                          }}
                        >
                          <Subheading style={{ fontWeight: "bold" }}>
                            {office.office}
                          </Subheading>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: "flex-end",
                            justifyContent: "center",
                            paddingRight: "5%",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              marginRight: "-4%",
                            }}
                          >
                            {loading[office.office] && (
                              <Button
                                loading={true}
                                color="red"
                                style={{ margin: 0, padding: 0 }}
                              />
                            )}

                            <IconButton
                              icon="close"
                              color="red"
                              size={22}
                              style={{ margin: 0 }}
                              onPress={() => {
                                removeOffice(office.office);
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableRipple>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
};

export default RemoveOffice;
