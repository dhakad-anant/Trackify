import React, { useState } from "react";
import {
  View,
  ImageBackground,
  StatusBar,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native";
import { Text, Title, IconButton, Caption, Chip } from "react-native-paper";
import Search from "./Search";
import { FontAwesome } from "@expo/vector-icons";
import config from "../config";

const FileTimeline = (props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [file, setFile] = useState({
    token: props.token,
    name: props.name,
    history: [
      {
        date: "",
        action: "",
        remarks: "",
      },
    ],
    tags: [],
  });
  const [showTags, setShowTags] = useState(file.tags.slice(0, 2));
  const [tagsMenuVisible, setTagsMenuVisible] = useState(false);
  const openTagsMenu = () => setTagsMenuVisible(true);
  const closeTagsMenu = () => setTagsMenuVisible(false);
  const setTags = async (checked) => {
    console.log("Closed");
    var newFile = { ...file };
    newFile.tags = checked;
    setFile(newFile);
    setShowTags(newFile.tags.slice(0, 2));
    // API CALL TO CHANGE TAGS
    console.log(checked.join("$"));
    let fd = new FormData();
    fd.append("tags", checked.join("$"));
    fd.append("file_id", props.token);
    let ret = await fetch(config.ip + "/fileTag", {
      method: "POST",
      body: fd,
      headers: {
        "content-type": "multipart/form-data",
      },
    });
    ret = await ret.json();
    if (ret.error) alert("Some error occurred! Restart App");
  };

  if (file.history[0].date.length == 0) {
    fetch(config.ip + "/fileHistory?tag=" + props.token, { method: "GET" })
      .then(async (ret) => {
        ret = await ret.json();
        setFile(ret);
        setShowTags(ret.tags.slice(0, 2));
      })
      .catch(() => alert("Could not get details!"));
  }

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
        imageStyle={{ opacity: 0.5 }}
        resizeMode={"cover"}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "flex-start",
            backgroundColor: "transparent",
            paddingLeft: "8%",
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
          <View
            style={{
              marginTop: 3.5 * StatusBar.currentHeight,
              flex: 1,
              width: "100%",
            }}
          >
            <View style={{ height: "17.5%" }}>
              <Title style={{ fontSize: 30, flexWrap: "wrap" }}>
                {file.name}
              </Title>
              <Caption style={{ fontSize: 15 }}>
                Tracking ID: {file.token}
              </Caption>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  height: "auto",
                  marginTop: "1.8%",
                }}
              >
                <Chip
                  textStyle={{ fontSize: 11 }}
                  onPress={openTagsMenu}
                  style={{ borderRadius: 0, marginRight: 4 }}
                  icon="pencil"
                >
                  Edit tags
                </Chip>
                <Search
                  searchFor="tags"
                  showModal={tagsMenuVisible}
                  closeModal={closeTagsMenu}
                  setOption={setTags}
                  multiple={true}
                  checked={file.tags}
                  addNew={true}
                />
                {showTags.map((tag) => {
                  return (
                    <Chip
                      textStyle={{ fontSize: 11 }}
                      onPress={() => {}}
                      style={{ borderRadius: 0, marginRight: 4 }}
                      key={tag}
                    >
                      {tag}
                    </Chip>
                  );
                })}
                {showTags.length < file.tags.length && (
                  <Chip
                    textStyle={{ fontSize: 11 }}
                    onPress={() => {}}
                    style={{ borderRadius: 0, marginRight: 4 }}
                  >
                    +{String(file.tags.length - showTags.length)}
                  </Chip>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  height: "auto",
                }}
              ></View>
            </View>

            <View
              style={{
                width: "100%",
                marginLeft: "-1.5%",
                height: "82%",
              }}
            >
              <ScrollView
                style={{
                  width: "100%",
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      // dummy logic
                      var oldfile = { ...file };
                      var new_history = [
                        {
                          date:
                            "4:20 pm, February 5, " +
                            String(
                              Math.floor(Math.random() * (9999 - 1001) + 1001)
                            ),
                          action: "Scanned by Dr. Doctor",
                          remarks: "Nice budget",
                        },
                      ].concat(file.history);
                      oldfile.history = new_history;
                      setFile(oldfile);
                    }}
                  />
                }
              >
                <View
                  style={{
                    borderLeftWidth: 2,
                    backgroundColor: "transparent",
                    paddingTop: "5%",
                    width: "100%",
                    paddingRight: "5%",
                    marginLeft: "3%",
                    marginTop: "0%",
                  }}
                >
                  {file.history.map((event) => {
                    return (
                      <View
                        style={{
                          paddingLeft: "10%",
                          position: "relative",
                          marginBottom: "6%",
                        }}
                        key={event.date}
                      >
                        <Caption>{event.date}</Caption>
                        <FontAwesome
                          name="circle"
                          size={14}
                          color="black"
                          style={{
                            position: "absolute",
                            top: "42%",
                            left: "-2.4%",
                          }}
                        />
                        <Text
                          style={{ fontWeight: "bold", paddingBottom: "0.8%" }}
                        >
                          {event.action}
                        </Text>
                        <Text>
                          {event.remarks
                            ? "Remarks: " + event.remarks
                            : "No remark added"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Modal>
  );
};

export default FileTimeline;
