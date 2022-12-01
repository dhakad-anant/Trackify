import React, { useState, useEffect } from "react";
import {
  Appbar,
  Button,
  TouchableRipple,
  Menu,
  Subheading,
  Paragraph,
  FAB,
  IconButton,
  Provider,
  TextInput,
  Title,
  List,
} from "react-native-paper";
import {
  View,
  ImageBackground,
  Animated,
  Image,
  StatusBar,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Camera } from "expo-camera";
// import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import DatePicker from "react-native-datepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FileTimeline from "./FileTimeline";
import FileAction from "./FileAction";
import ScanToken from "./ScanToken";
import config from "../config";

// ======================= Parameters =======================

// Column widths for the 3 tabs (add any number of new columns here) (make sure sum = 100%)
const columns = [
  { name: "21%", trackingID: "15%", type: "15%", status: "29%", time: "20%" },
  {
    name: "16.5%",
    owner: "15.5%",
    dept: "18.5%",
    passed_by: "19%",
    trackingID: "10.5%",
    type: "9%",
    time: "11%",
  },
  {
    confirmReceipt: "5%",
    name: "17%",
    owner: "12.5%",
    dept: "17.5%",
    passed_by: "18%",
    trackingID: "10%",
    type: "10%",
    time: "15%",
  },
];

const horizontalScrollWidth = 1100; // Horizontal scrollable width (increase if it's too squeezed)

const doNotSortBy = ["status", "confirmReceipt"]; // no sorting will be done when clicking on these

const searchByFields = [
  "name",
  "owner",
  "dept",
  "passed_by",
  "trackingID",
  "type",
  "tags",
  "handledBy",
]; // user can search using these fields
const searchByModalHeight = 0.6; // increase if you add too many fields in the previous array

const displayNames = {
  // Title to be displayed for each column
  name: "Name",
  owner: "From",
  dept: "Department",
  passed_by: "Sent by",
  trackingID: "Tracking ID",
  type: "Type",
  status: "Status",
  time: "Date",
  confirmReceipt: "",
  handledBy: "Handled By",
  tags: "Tags",
};

// ==============================================================

Date.prototype.displayFormat = function () {
  var date = this.toDateString().slice(4);
  return [date.slice(0, 6), ",", date.slice(6)].join("");
};

Date.prototype.processingFormat = function () {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [
    (dd > 9 ? "" : "0") + dd,
    (mm > 9 ? "" : "0") + mm,
    this.getFullYear(),
  ].join("/");
};

const Landing = ({ navigation, success }) => {
  const [viewingFile, setViewingFile] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [postScanning, setPostScanning] = useState(null);
  const [fileAction, setFileAction] = useState(false);
  const [token, setToken] = useState(null);
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState([]); // pass filter object as props
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isOfficeAccount, setIsOfficeAccount] = useState(false);
  const [office, setOffice] = useState("");
  const [offices, setOffices] = useState(null);
  const [tab, setTab] = useState(0);
  const [x0, setX0] = useState(0);
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0);
  const [translateX, setTranslateX] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessInit, setShowSuccessInit] = useState(false);

  const [sortBy, setSortBy] = useState("time");
  const [ascending, setAscending] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDateRef, setStartDateRef] = useState(null);
  const [endDateRef, setEndDateRef] = useState(null);
  const [dateWatcher, setDateWatcher] = useState(true);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [showSearchByMenu, setShowSearchByMenu] = useState(false);

  const loadOffices = (x) =>
    AsyncStorage.getItem("@offices").then((ret) => {
      if (ret == null) return 0;
      ret = JSON.parse(ret);
      if (ret.length && x) {
        setIsOfficeAccount(true);
        setTab(0);
      }
      setOffices(ret);
      AsyncStorage.getItem("@office").then((ret) => {
        if (ret != null) {
          setOffice(ret);
          setTimeout(() => loadOffices(false), 2000);
        }
      });
    });

  if (offices == null) loadOffices(true);

  const handleSlide = (x) => {
    Animated.spring(translateX, {
      toValue: x,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (success && !showSuccessInit) {
      setShowSuccess(true);
      setShowSuccessInit(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }

    // Make API call based on value of tab. (1 = queue, 2=received, 3 = sent)
    // Make sure to setLoading to false
    if (tab === 0 && loading) {
      fetch(config.ip + "/showFiles", { method: "GET" })
        .then(async (ret) => {
          ret = await ret.json();
          setFiles(ret);
          setFilteredFiles(ret);
          setLoading(false);
        })
        .catch(() => {
          alert("Could not get files!");
          setLoading(false);
        });
    } else if (tab === 1) {
      fetch(config.ip + "/showReceived?office=" + office, {
        method: "GET",
      })
        .then(async (ret) => {
          ret = await ret.json();
          setFiles(ret);
          setFilteredFiles(ret);
          setLoading(false);
        })
        .catch(() => {
          alert("Could not get files!");
          setLoading(false);
        });
    } else if (tab === 2) {
      fetch(config.ip + "/showQueue?office=" + office, {
        method: "GET",
      })
        .then(async (ret) => {
          ret = await ret.json();
          setFiles(ret);
          setFilteredFiles(ret);
          setLoading(false);
        })
        .catch(() => {
          alert("Could not get files!");
          setLoading(false);
        });
    }
  }, [tab, office]);

  useEffect(() => {
    var filtered = files.filter((file) => {
      if (startDate && new Date(file.time) < startDate) return false;
      if (endDate && new Date(file.time) > endDate) return false;
      return true;
    });

    if (query.length > 0 && filtered.length > 0) {
      var reg = new RegExp(query.split("").join("\\w*").replace(/\W/, ""), "i");
      if (typeof filtered[0][searchBy] == "string") {
        filtered = filtered.filter((file) => {
          if (file[searchBy].match(reg)) return file;
        });
      } else {
        filtered = filtered.filter((file) => {
          for (const option of file[searchBy]) {
            if (option.match(reg)) return file;
          }
        });
      }
    }

    filtered.sort((file1, file2) => {
      if (sortBy == "time") {
        if (new Date(file1.time) < new Date(file2.time))
          return ascending ? -1 : 1;
        else return ascending ? 1 : -1;
      } else
        return (
          (ascending ? 1 : -1) * file1[sortBy].localeCompare(file2[sortBy])
        );
    });
    setFilteredFiles(filtered);
  }, [files, sortBy, ascending, dateWatcher, query, showSuccess]);

  useEffect(() => {
    setQuery("");
  }, [searchBy]);

  return (
    <Provider style={{ height: Dimensions.get("window").height }}>
      {showSuccess && (
        <ImageBackground
          imageStyle={{ opacity: 0.5 }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
          source={require("../assets/white_bg.png")}
          resizeMode={"cover"} // cover or contain its upto you view look
        >
          <Image
            style={{ height: 400, width: 400 }}
            source={require("../assets/success.gif")}
          />
        </ImageBackground>
      )}
      <ImageBackground
        style={{ flex: 1, resizeMode: "cover" }}
        source={require("../assets/black_bg.jpg")}
        resizeMode={"cover"} // cover or contain its upto you view look
      >
        <Appbar.Header
          statusBarHeight={0}
          style={{
            backgroundColor: "rgba(0,0,0,0)",
            elevation: 0,
          }}
        >
          <Appbar.Action icon="menu" onPress={navigation.openDrawer} />
          {isOfficeAccount && (
            <>
              <Appbar.Content
                onPress={() => setMenuVisible(true)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "3.5%",
                  height: "80%",
                  justifyContent: "center",
                  paddingTop: "4%",
                  borderRadius: 15,
                  overflow: "hidden",
                }}
                titleStyle={{
                  fontWeight: "700",
                  fontSize: 20,
                  lineHeight: 20,
                  textAlignVertical: "center",
                  fontFamily: "Roboto",
                }}
                title={office}
              />
              {offices != null && (
                <Menu
                  visible={menuVisible}
                  style={{ width: "90%" }}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Appbar.Action
                      onPress={() => setMenuVisible(true)}
                      color="white"
                      icon="chevron-down"
                    />
                  }
                >
                  {offices.map((x) => {
                    return (
                      <Menu.Item
                        onPress={() => {
                          if (tab != 0) setLoading(true);
                          setOffice(x.office);
                          setMenuVisible(false);
                          AsyncStorage.setItem("@office", x.office);
                        }}
                        title={x.office}
                        key={x.office}
                      />
                    );
                  })}
                </Menu>
              )}
            </>
          )}
        </Appbar.Header>

        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <View
            style={{
              height: isOfficeAccount ? "25%" : "18%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isOfficeAccount && (
              <Button
                mode="outlined"
                style={{
                  justifyContent: "center",
                  borderColor: "white",
                  borderWidth: 0.5,
                  width: "65%",
                  marginTop: "-2%",
                }}
                color="white"
                onPress={async () => {
                  const { status } = await Camera.requestPermissionsAsync();
                  if (status === "granted") {
                    setPostScanning("scan");
                    setScanning(true);
                  }
                }}
              >
                <AntDesign name="scan1" size={14} color="white" />
                {"   "}Scan a file
              </Button>
            )}

            <Button
              mode="outlined"
              style={{
                justifyContent: "center",
                borderColor: "white",
                borderWidth: 0.5,
                marginTop: isOfficeAccount ? "3%" : "-10%",
                width: "65%",
              }}
              color="white"
              onPress={() => {
                navigation.navigate("NewFile");
              }}
            >
              <AntDesign name="addfile" size={14} color="white" />
              {"   "}Create new file
            </Button>
            <Button
              mode="outlined"
              style={{
                justifyContent: "center",
                borderColor: "white",
                borderWidth: 0.5,
                marginTop: isOfficeAccount ? "3%" : "5%",
                width: "65%",
              }}
              color="white"
              onPress={async () => {
                const { status } = await Camera.requestPermissionsAsync();
                if (status === "granted") {
                  setPostScanning("track");
                  setScanning(true);
                }
              }}
            >
              <AntDesign name="search1" size={14} color="white" />
              {"   "}Track existing file
            </Button>
          </View>
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              overflow: "hidden",
              flex: 1,
              alignItems: "center",
              paddingTop: "0%",
            }}
          >
            <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
              {isOfficeAccount && (
                <View
                  style={{
                    marginTop: "3%",
                    marginBottom: "3%",
                    alignItems: "center",
                    width: "90%",
                    flexDirection: "row",
                    position: "relative",
                  }}
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: "33%",
                      height: "100%",
                      borderBottomColor: "black",
                      borderBottomWidth: 1,
                      transform: [{ translateX }],
                    }}
                  />
                  <Button
                    mode="outlined"
                    style={{
                      borderWidth: 0,
                      width: "33%",
                    }}
                    color={tab === 0 ? "black" : "grey"}
                    onPress={() => {
                      if (tab === 0) return;
                      setLoading(true);
                      handleSlide(x0);
                      setTab(0);
                    }}
                    onLayout={(event) => setX0(event.nativeEvent.layout.x)}
                  >
                    Created
                  </Button>
                  <Button
                    mode="outlined"
                    style={{
                      borderWidth: 0,
                      width: "33%",
                    }}
                    color={tab === 1 ? "black" : "grey"}
                    onPress={() => {
                      if (tab === 1) return;
                      setLoading(true);
                      handleSlide(x1);
                      setTab(1);
                    }}
                    onLayout={(event) => setX1(event.nativeEvent.layout.x)}
                  >
                    Received
                  </Button>
                  <Button
                    mode="outlined"
                    style={{
                      borderWidth: 0,
                      width: "33%",
                    }}
                    color={tab === 2 ? "black" : "grey"}
                    onPress={() => {
                      if (tab === 2) return;
                      setLoading(true);
                      handleSlide(x2);
                      setTab(2);
                    }}
                    onLayout={(event) => setX2(event.nativeEvent.layout.x)}
                  >
                    Queue
                  </Button>
                </View>
              )}

              {loading && (
                <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
                  <Image
                    source={require("../assets/loading.gif")}
                    style={{ height: 200, width: 200 }}
                  />
                </View>
              )}

              {!loading && (
                <>
                  <TextInput
                    placeholder={"Search by " + displayNames[searchBy]}
                    value={query}
                    maxLength={20}
                    onChangeText={(input) => setQuery(input)}
                    mode="outlined"
                    selectionColor="rgba(0, 0, 0, 0.2)"
                    style={{
                      marginTop: isOfficeAccount ? 0 : "5%",
                      width: "92%",
                      marginBottom: "5%",
                      height: 0.07 * Dimensions.get("window").height,
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                    theme={{
                      colors: {
                        primary: "black",
                        underlineColor: "transparent",
                      },
                    }}
                    left={
                      <TextInput.Icon
                        name={() => (
                          <AntDesign name="search1" size={16} color="black" />
                        )}
                        style={{ marginTop: "50%" }}
                        onPress={() => {}}
                      />
                    }
                    right={
                      <TextInput.Icon
                        name="chevron-down"
                        style={{ marginTop: "50%" }}
                        onPress={() => {
                          setShowSearchByMenu(true);
                        }}
                      />
                    }
                  />
                  <Modal
                    animationType="slide"
                    visible={showSearchByMenu}
                    useNativeDriver={true}
                    animationIn="slideInLeft"
                    animationOut="slideOutRight"
                    onRequestClose={() => {
                      setShowSearchByMenu(false);
                    }}
                    transparent={true}
                    opacity={1}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(0,0,0,0.6)",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      <View
                        behavior="padding"
                        style={{
                          backgroundColor: "white",
                          width: 0.85 * Dimensions.get("window").width,
                          height:
                            tab != 0
                              ? searchByModalHeight *
                                Dimensions.get("window").height
                              : 0.4 * Dimensions.get("window").height,
                          justifyContent: "center",
                          alignItems: "center",
                          position: "relative",
                          borderRadius: 10,
                        }}
                      >
                        <IconButton
                          icon="close"
                          color="black"
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                          }}
                          onPress={() => {
                            setShowSearchByMenu(false);
                          }}
                        />
                        <Title style={{ marginBottom: "10%" }}>Search by</Title>
                        {searchByFields
                          .filter(
                            (x) =>
                              x == "handledBy" ||
                              x == "tags" ||
                              columns[tab][x] != undefined
                          )
                          .map((field, idx) => {
                            return (
                              <List.Item
                                key={field}
                                title={displayNames[field]}
                                onPress={() => {
                                  setSearchBy(field);
                                  setShowSearchByMenu(false);
                                }}
                                style={{
                                  width: "78%",
                                  borderBottomWidth: 1,
                                  borderTopWidth: idx == 0 ? 1 : 0,
                                  borderColor: "rgba(0, 0, 0, 0.3)",
                                  paddingVertical: "2%",
                                  paddingLeft: "0%",
                                }}
                                titleStyle={{ alignSelf: "center" }}
                              />
                            );
                          })}
                      </View>
                    </View>
                  </Modal>
                  {filteredFiles.length === 0 && (
                    <Subheading
                      style={{ marginTop: isOfficeAccount ? "4%" : "20%" }}
                    >
                      No files to show!
                    </Subheading>
                  )}
                  {filteredFiles.length > 0 && (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        paddingBottom: isOfficeAccount ? "40%" : "30%",
                        paddingHorizontal: "4%",
                        marginTop: isOfficeAccount ? 0 : "0%",
                      }}
                    >
                      <ScrollView
                        nestedScrollEnabled
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <ScrollView
                          horizontal
                          nestedScrollEnabled
                          style={{
                            width: "100%",
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <View
                              style={{
                                borderWidth: 1,
                                borderRightWidth: 0,
                                width: horizontalScrollWidth,
                                flexDirection: "row",
                              }}
                            >
                              {Object.keys(columns[tab]).map(function (column) {
                                return (
                                  <TouchableRipple
                                    key={column}
                                    onPress={() => {
                                      if (doNotSortBy.includes(column)) return;
                                      if (sortBy == column)
                                        setAscending(!ascending);
                                      else {
                                        setSortBy(column);
                                        if (column == "time")
                                          setAscending(false);
                                        else setAscending(true);
                                      }
                                    }}
                                    rippleColor="rgba(0, 0, 0, .3)"
                                    style={{
                                      paddingHorizontal: "2%",
                                      paddingVertical: "1%",
                                      width: columns[tab][column],
                                      borderRightWidth: 1,
                                      backgroundColor: "rgba(0, 0, 0, 0.15)",
                                      flexDirection: "row",
                                    }}
                                  >
                                    <>
                                      <Paragraph
                                        style={{ fontWeight: "bold" }}
                                        numberOfLines={1}
                                        ellipsizeMode={
                                          column == sortBy ? "middle" : null
                                        }
                                      >
                                        {displayNames[column]}
                                        {column == sortBy && (
                                          <AntDesign
                                            name={
                                              ascending
                                                ? "arrowdown"
                                                : "arrowup"
                                            }
                                            size={16}
                                            style={{
                                              marginTop: "2%",
                                            }}
                                            color="black"
                                          />
                                        )}
                                      </Paragraph>
                                    </>
                                  </TouchableRipple>
                                );
                              })}
                            </View>
                            {filteredFiles.map((file, idx) => {
                              // console.log(file);
                              return (
                                <TouchableRipple
                                  key={file.trackingID}
                                  onPress={() => {
                                    if (tab == 0) {
                                      setToken(file.trackingID);
                                      setFileName(file.name);
                                      setViewingFile(true);
                                    } else if (tab == 1) {
                                      setToken(file.trackingID);
                                      setFileName(file.name);
                                      setFileAction(true);
                                    }
                                  }}
                                  rippleColor="rgba(0, 0, 0, .05)"
                                >
                                  <View
                                    // key={file.trackingID}
                                    style={{
                                      borderWidth: 1,
                                      borderRightWidth: 0,
                                      borderTopWidth: idx == 0 ? 1 : 0,
                                      width: horizontalScrollWidth,
                                      flexDirection: "row",
                                    }}
                                  >
                                    {Object.keys(columns[tab]).map(function (
                                      column
                                    ) {
                                      return (
                                        <View
                                          key={column}
                                          style={{
                                            paddingHorizontal: "2%",
                                            paddingVertical:
                                              column == "confirmReceipt"
                                                ? "0%"
                                                : "1%",
                                            paddingLeft:
                                              column == "confirmReceipt"
                                                ? "0.2%"
                                                : "1%",
                                            width: columns[tab][column],
                                            borderRightWidth: 1,
                                          }}
                                        >
                                          {column != "confirmReceipt" && (
                                            <Paragraph numberOfLines={1}>
                                              {column == "time" &&
                                                new Date(
                                                  file[column]
                                                ).displayFormat()}

                                              {column != "time" && file[column]}
                                            </Paragraph>
                                          )}
                                          {column == "confirmReceipt" && (
                                            <View
                                              style={{
                                                flexDirection: "row",
                                              }}
                                            >
                                              <IconButton
                                                icon="check"
                                                color="green"
                                                size={18}
                                                onPress={() => {
                                                  let formData = new FormData();
                                                  formData.append(
                                                    "tag",
                                                    file.trackingID
                                                  );
                                                  fetch(
                                                    config.ip + "/confirmFile",
                                                    {
                                                      method: "POST",
                                                      body: formData,
                                                      headers: {
                                                        "content-type":
                                                          "multipart/form-data",
                                                      },
                                                    }
                                                  )
                                                    .then(async (ret) => {
                                                      ret = await ret.json();
                                                      if (ret.error) {
                                                        alert(
                                                          "Some error occurred!"
                                                        );
                                                        return 0;
                                                      } else {
                                                        setFiles((files) => {
                                                          return files.filter(
                                                            (x) =>
                                                              x.trackingID !=
                                                              file.trackingID
                                                          );
                                                        });
                                                      }
                                                    })
                                                    .catch(() =>
                                                      alert(
                                                        "Could not update status!"
                                                      )
                                                    );
                                                }}
                                              />
                                            </View>
                                          )}
                                        </View>
                                      );
                                    })}
                                  </View>
                                </TouchableRipple>
                              );
                            })}
                          </View>
                        </ScrollView>
                      </ScrollView>
                    </View>
                  )}
                </>
              )}

              <FAB
                icon="calendar"
                color="white"
                small
                // size={30}
                style={{
                  position: "absolute",
                  bottom: 80,
                  right: "6%",
                  backgroundColor: "black",
                  // width: "15.5%",
                  // height: "8.2%",
                }}
                onPress={() => setShowDateFilter(true)}
              />

              <FAB
                icon="refresh"
                color="white"
                small
                // size={30}
                style={{
                  position: "absolute",
                  bottom: 32,
                  right: "6%",
                  backgroundColor: "black",
                  // width: "15.5%",
                  // height: "8.2%",
                }}
                onPress={() => {
                  // dummy logic
                  setLoading(true);
                  let url = config.ip + "/showFiles";
                  if (tab == 1)
                    url = config.ip + "/showReceived?office=" + office;
                  else if (tab == 2)
                    url = config.ip + "/showQueue?office=" + office;

                  fetch(url, { method: "GET" })
                    .then(async (ret) => {
                      ret = await ret.json();
                      setFiles(ret);
                      setLoading(false);
                    })
                    .catch(() => {
                      alert("Could not get files!");
                      setLoading(false);
                    });
                }}
              />

              <Modal
                animationType="slide"
                visible={showDateFilter}
                useNativeDriver={true}
                animationIn="slideInLeft"
                animationOut="slideOutRight"
                onRequestClose={() => {
                  setShowDateFilter(false);
                }}
                transparent={true}
                opacity={1}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <View
                    behavior="padding"
                    style={{
                      backgroundColor: "white",
                      width: 0.85 * Dimensions.get("window").width,
                      height: 0.4 * Dimensions.get("window").height,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      borderRadius: 10,
                    }}
                  >
                    <Pressable
                      onPress={() => startDateRef.onPressDate()}
                      style={{ width: "70%" }}
                    >
                      <TextInput
                        label="After"
                        value={startDate ? startDate.displayFormat() : null}
                        mode="outlined"
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
                            onPress={() => {
                              startDateRef.onPressDate();
                            }}
                          />
                        }
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => endDateRef.onPressDate()}
                      style={{ width: "70%" }}
                    >
                      <TextInput
                        label="Before"
                        value={endDate ? endDate.displayFormat() : null}
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
                            onPress={() => {
                              endDateRef.onPressDate();
                            }}
                          />
                        }
                      />
                    </Pressable>
                    <DatePicker
                      date={
                        startDate
                          ? startDate.processingFormat()
                          : new Date().processingFormat()
                      }
                      mode="date"
                      format="DD/MM/YYYY"
                      showIcon={false}
                      hideText={true}
                      style={{ height: 0, width: 0 }}
                      onDateChange={(date) => {
                        var dateParts = date.split("/");
                        var newDate = new Date(
                          +dateParts[2],
                          dateParts[1] - 1,
                          +dateParts[0]
                        );
                        setStartDate(newDate);
                      }}
                      ref={(ref) => setStartDateRef(ref)}
                    />
                    <DatePicker
                      date={
                        endDate
                          ? endDate.processingFormat()
                          : new Date().processingFormat()
                      }
                      mode="date"
                      format="DD/MM/YYYY"
                      showIcon={false}
                      hideText={true}
                      style={{ height: 0, width: 0 }}
                      onDateChange={(date) => {
                        var dateParts = date.split("/");
                        var newDate = new Date(
                          +dateParts[2],
                          dateParts[1] - 1,
                          +dateParts[0]
                        );
                        setEndDate(newDate);
                      }}
                      ref={(ref) => setEndDateRef(ref)}
                    />
                    <View style={{ flexDirection: "row", height: "20%" }}>
                      <Button
                        icon="eraser"
                        style={{
                          width: "34%",
                          // height: "18%",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "4%",
                          paddingVertical: "1%",
                        }}
                        mode="contained"
                        color="black"
                        onPress={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        icon="file-find"
                        style={{
                          width: "34%",
                          // height: "18%",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "4%",
                          paddingVertical: "1%",
                          marginLeft: "2%",
                        }}
                        mode="contained"
                        color="black"
                        onPress={() => {
                          if (startDate && endDate && startDate > endDate) {
                            alert("Please check the order of the dates!");
                            return;
                          }
                          setDateWatcher(!dateWatcher);
                          setShowDateFilter(false);
                        }}
                      >
                        Find
                      </Button>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </View>
      </ImageBackground>
      {token && (
        <FileTimeline
          showModal={viewingFile}
          token={token}
          name={fileName}
          closeModal={() => {
            setViewingFile(false);
            setToken(null);
            setLoading(true);
            let url = config.ip + "/showFiles";
            if (tab == 1) url = config.ip + "/showReceived?office=" + office;
            else if (tab == 2) url = config.ip + "/showQueue?office=" + office;

            fetch(url, { method: "GET" })
              .then(async (ret) => {
                ret = await ret.json();
                setFiles(ret);
                setLoading(false);
              })
              .catch(() => {
                alert("Could not get files!");
                setLoading(false);
              });
          }}
        />
      )}
      {token && (
        <FileAction
          showModal={fileAction}
          token={token}
          name={fileName}
          navigation={navigation}
          office={office}
          onSuccess={() => {
            setToken(null);
            setFileAction(false);
            setLoading(true);
            let url = config.ip + "/showFiles";
            if (tab == 1) url = config.ip + "/showReceived?office=" + office;
            else if (tab == 2) url = config.ip + "/showQueue?office=" + office;

            fetch(url, { method: "GET" })
              .then(async (ret) => {
                ret = await ret.json();
                setFiles(ret);
                setLoading(false);
              })
              .catch(() => {
                alert("Could not get files!");
                setLoading(false);
              });
          }}
          closeModal={() => {
            setFileAction(false);
            setToken(null);
          }}
        />
      )}
      <ScanToken
        showModal={scanning}
        closeModal={() => {
          setScanning(false);
        }}
        onSubmit={
          postScanning == "track"
            ? (tag) => {
                setToken(tag);
                setFileName("");
                setViewingFile(true);
              }
            : (tag) => {
                fetch(
                  config.ip + "/confirmed?tag=" + tag + "&office=" + office,
                  { method: "GET" }
                )
                  .then(async (ret) => {
                    ret = await ret.json();
                    if (ret.error) {
                      alert("Some error occurred!");
                      return 0;
                    }
                    setFileName(ret.name);
                    if (ret.confirmed) {
                      setToken(tag);
                      setFileAction(true);
                      return 0;
                    }
                    let formData = new FormData();
                    formData.append("tag", tag);
                    fetch(config.ip + "/confirmFile", {
                      method: "POST",
                      body: formData,
                      headers: {
                        "content-type": "multipart/form-data",
                      },
                    })
                      .then(async (ret) => {
                        ret = await ret.json();
                        if (ret.error) {
                          alert("Some error occurred!");
                          return 0;
                        } else if (tab == 2) {
                          setFiles((files) => {
                            return files.filter((x) => x.trackingID != tag);
                          });
                        }
                      })
                      .catch(() => alert("Could not update status!"));
                  })
                  .catch(() => alert("Error contacting server!"));
              }
        }
      />
      <StatusBar backgroundColor="#1b1e25" barStyle="light-content" />
    </Provider>
  );
};

export default Landing;
