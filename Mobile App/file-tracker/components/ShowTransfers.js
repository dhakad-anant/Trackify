import React, { useState, useEffect } from "react";
import {
  Title,
  Subheading,
  Paragraph,
  Caption,
  IconButton,
  TouchableRipple,
} from "react-native-paper";
import {
  View,
  ImageBackground,
  RefreshControl,
  StatusBar,
  ScrollView,
} from "react-native";
import config from "../config";

const ShowTransfers = (props) => {
  const [files, setFiles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const reload = async () => {
    // alert(JSON.stringify(offices));
    setRefreshing(true);
    let ret = await fetch(config.ip + "/showTransfers", { method: "GET" });
    ret = await ret.json();
    if (ret.error) {
      setRefreshing(false);
      alert("Could not get files!");
      return 0;
    }

    setFiles(ret);
    setRefreshing(false);
  };

  if (!loaded) {
    setLoaded(true);
    reload();
  }

  const confirmFile = (tid) => {
    return async () => {
      setRefreshing(true);
      let ret = await fetch(config.ip + "/confirmTransfer?tid=" + tid, {
        method: "GET",
      });
      ret = await ret.json();
      if (ret.error || ret.error == undefined) {
        setRefreshing(false);
        alert("Could not confirm tranfer!");
        return 0;
      }
      setRefreshing(false);
      setFiles((file) => {
        file = JSON.parse(JSON.stringify(file));
        return file.filter((f) => f.t_id != tid);
      });
    };
  };

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
              paddingLeft: "8%",
            }}
          >
            Pending Transfers
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => reload()}
              />
            }
          >
            <View style={{ width: "100%", alignItems: "center" }}>
              {files.length === 0 && (
                <Subheading style={{ marginTop: "4%", paddingLeft: "2%" }}>
                  No files to show!
                </Subheading>
              )}

              {files.map((file, idx) => {
                return (
                  <View
                    style={{
                      width: "85%",
                      height: 100,
                      borderColor: "black",
                      borderWidth: 1,
                      borderRadius: 10,
                      marginTop: idx === 0 ? "1.25%" : "4%",
                      overflow: "hidden",
                    }}
                    key={file.trackingID}
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
                            {file.name}
                          </Subheading>
                          <Paragraph style={{ fontStyle: "italic" }}>
                            {file.from}
                          </Paragraph>
                          <Caption>Tracking ID: {file.trackingID}</Caption>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: "flex-end",
                            justifyContent: "center",
                            paddingRight: "5%",
                          }}
                        >
                          <IconButton
                            icon="check"
                            size={26}
                            color="green"
                            onPress={confirmFile(file.t_id)}
                          />
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

export default ShowTransfers;
