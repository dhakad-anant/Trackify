import React, { useState, useEffect } from "react";
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
  Platform,
  Modal,
} from "react-native";
import Search from "./Search";
import DateTimePicker from "@react-native-community/datetimepicker";

Date.prototype.convert = function () {
  var date = this.toDateString().slice(4);
  return [date.slice(0, 6), ",", date.slice(6)].join("");
};

const Filter = (props) => {
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currStartDate, setCurrStartDate] = useState(new Date());
  const [currEndDate, setCurrEndDate] = useState(new Date());
  const [fileTypes, setFileTypes] = useState([]);
  const [handledBy, setHandledBy] = useState([]);
  const [tags, setTags] = useState([]);
  const [fileTypesText, setFileTypesText] = useState("");
  const [handledByText, setHandledByText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [fileMenuVisible, setFileMenuVisible] = useState(false);
  const [officeMenuVisible, setOfficeMenuVisible] = useState(false);
  const [tagsMenuVisible, setTagsMenuVisible] = useState(false);
  const [errors, setErrors] = useState([undefined]);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowStart(Platform.OS === "ios");
    setStartDate(currentDate);
    setCurrStartDate(currentDate);
  };
  const onEndDateChange = (event, selectedDate) => {
    setShowEnd(Platform.OS === "ios");
    setEndDate(selectedDate);
    setCurrEndDate(selectedDate);
  };

  const openFileMenu = () => setFileMenuVisible(true);
  const closeFileMenu = () => setFileMenuVisible(false);
  const openOfficeMenu = () => setOfficeMenuVisible(true);
  const closeOfficeMenu = () => setOfficeMenuVisible(false);
  const openTagsMenu = () => setTagsMenuVisible(true);
  const closeTagsMenu = () => setTagsMenuVisible(false);
  const validateForm = () => {
    var newErrors = [undefined];
    if (startDate && endDate && startDate > endDate)
      newErrors[0] = "Please check the order of the dates";
    setErrors(newErrors);
  };

  const makeFilterObject = () => {
    return {
      startDate: startDate,
      endDate: endDate,
      sortAsc: sortAsc,
      fileTypes: fileTypes,
      handledBy: handledBy,
      tags: tags,
    };
  };

  const clearAll = () => {
    props.setFilterObject(null);
    setStartDate(null);
    setEndDate(null);
    setCurrStartDate(new Date());
    setCurrEndDate(new Date());
    setFileTypes([]);
    setHandledBy([]);
    setTags([]);
    setFileTypesText("");
    setFileTypesText("");
    setTagsText("");
    setSortAsc(false);
    setErrors([undefined]);
  };

  useEffect(() => {
    setFileTypesText(fileTypes.join(", "));
    setHandledByText(handledBy.join(", "));
    setTagsText(tags.join(", "));
    if (tab != props.tab) {
      setTab(props.tab);
      clearAll();
    }
  }, [fileTypes, handledBy, props.tab, tags]);

  return (
    <Provider>
      <Modal
        animationType="slide"
        visible={props.showModal}
        useNativeDriver={true}
        animationIn="slideInLeft"
        animationOut="slideOutRight"
        onRequestClose={() => {
          props.setFilterObject(makeFilterObject());
          props.closeModal();
        }}
      >
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
                {/* Need to add clearFilterObject function if close button is to be added (TBD)*/}
                {/* <IconButton
                  icon="chevron-down"
                  color="black"
                  size={30}
                  style={{
                    position: "absolute",
                    top: 1 * StatusBar.currentHeight,
                    left: 4,
                  }}
                  onPress={() => {
                    props.setFilterObject(makeFilterObject());
                    props.closeModal();
                  }}
                /> */}
                <View style={{ flexDirection: "row" }}>
                  <Title
                    style={{ fontSize: 30, flexWrap: "wrap", marginTop: "6%" }}
                  >
                    Filter
                  </Title>
                  <Button
                    icon="calendar-clock"
                    style={{
                      borderWidth: 0,
                      // width: "33%",
                      marginTop: "4%",
                      marginLeft: "24%",
                    }}
                    color="black"
                    onPress={() => {
                      setSortAsc(!sortAsc);
                    }}
                  >
                    {sortAsc ? "Desc" : "Asc"}
                  </Button>
                </View>
                <Pressable onPress={openFileMenu} style={{ width: "70%" }}>
                  <TextInput
                    label="File types"
                    value={fileTypesText}
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
                        onPress={openFileMenu}
                      />
                    }
                  />
                </Pressable>
                <Search
                  key="fileTypes"
                  searchFor="fileTypes"
                  showModal={fileMenuVisible}
                  closeModal={closeFileMenu}
                  setOption={setFileTypes}
                  multiple={true}
                  checked={[]}
                />
                <Pressable onPress={openOfficeMenu} style={{ width: "70%" }}>
                  <TextInput
                    label="Handled by"
                    value={handledByText}
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
                  key="offices"
                  searchFor="offices"
                  showModal={officeMenuVisible}
                  closeModal={closeOfficeMenu}
                  setOption={setHandledBy}
                  multiple={true}
                  checked={[]}
                />
                <Pressable onPress={openTagsMenu} style={{ width: "70%" }}>
                  <TextInput
                    label="Tags"
                    value={tagsText}
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
                        onPress={openTagsMenu}
                      />
                    }
                  />
                </Pressable>
                <Search
                  key="tags"
                  searchFor="tags"
                  showModal={tagsMenuVisible}
                  closeModal={closeTagsMenu}
                  setOption={setTags}
                  multiple={true}
                  checked={[]}
                  addNew={false}
                />
                <Pressable
                  onPress={() => setShowStart(true)}
                  style={{ width: "70%" }}
                >
                  <TextInput
                    label="After"
                    value={startDate ? startDate.convert() : ""}
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
                        onPress={() => setShowStart(true)}
                      />
                    }
                  />
                </Pressable>
                {showStart && (
                  <DateTimePicker
                    testID="startDate"
                    value={currStartDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}
                <Pressable
                  onPress={() => setShowEnd(true)}
                  style={{ width: "70%" }}
                >
                  <TextInput
                    label="Before"
                    value={endDate ? endDate.convert() : ""}
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
                        onPress={() => setShowEnd(true)}
                      />
                    }
                  />
                </Pressable>
                {showEnd && (
                  <DateTimePicker
                    testID="endDate"
                    value={currEndDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onEndDateChange}
                  />
                )}
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
                <View style={{ flexDirection: "row" }}>
                  <Button
                    icon="eraser"
                    style={{
                      width: "34%",
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "5%",
                      paddingVertical: "1%",
                    }}
                    mode="contained"
                    color="black"
                    onPress={clearAll}
                  >
                    Clear
                  </Button>
                  <Button
                    icon="check"
                    style={{
                      width: "34%",
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "5%",
                      paddingVertical: "1%",
                      marginLeft: "2%",
                    }}
                    mode="contained"
                    color="black"
                    onPress={() => {
                      validateForm();
                      if (!errors[0]) {
                        props.setFilterObject(makeFilterObject());
                        props.closeModal();
                      }
                    }}
                  >
                    Done
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </Modal>
    </Provider>
  );
};

export default Filter;
