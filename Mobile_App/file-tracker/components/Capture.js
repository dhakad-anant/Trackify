import React, { useState } from "react";
import { TouchableOpacity, View, ImageBackground } from "react-native";
import { Camera } from "expo-camera";
import { Button } from "react-native-paper";
import * as ImageManipulator from "expo-image-manipulator";

const Capture = (props) => {
  const [cameraRef, setCameraRef] = useState(null);
  const [image, setImage] = useState(null);
  // Camera.requestPermissionsAsync();
  return (
    <>
      {image && (
        <>
          <ImageBackground
            source={{ uri: image.uri }}
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "flex-end",
              alignContent: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignContent: "center",
                justifyContent: "center",
                backgroundColor: "black",
                height: "10%",
              }}
            >
              <Button
                icon="rotate-left"
                style={{
                  width: "40%",
                  height: "100%",
                  justifyContent: "center",
                }}
                color="white"
                onPress={() => {
                  setImage(null);
                }}
              >
                Retry
              </Button>
              {/* <Button
                icon="check"
                style={{
                  width: "40%",
                  height: "100%",
                  justifyContent: "center",
                }}
                color="white"
                onPress={() => {
                  props.onSubmit(image);
                }}
              >
                Submit
              </Button> */}
            </View>
          </ImageBackground>
        </>
      )}
      {!image && (
        <Camera
          style={{ flex: 1 }}
          // ratio="16:9"
          ref={(ref) => {
            setCameraRef(ref);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              justifyContent: "flex-end",
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                if (cameraRef) {
                  let image = await cameraRef.takePictureAsync({
                    quality: 0,
                    skipProcessing: true,
                  });
                  let resized = await ImageManipulator.manipulateAsync(
                    image.uri,
                    [
                      {
                        resize: {
                          height: image.height > image.width ? 400 : 300,
                        },
                      },
                    ],
                    { compress: 0.3 }
                  );
                  setImage(image);
                  props.onSubmit(resized);
                  // console.log("clicked!");
                }
              }}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 50,
                  borderColor: "white",
                  height: 50,
                  width: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  marginTop: 16,
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: 50,
                    borderColor: "white",
                    height: 40,
                    width: 40,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </>
  );
};

export default Capture;
