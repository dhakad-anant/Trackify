import React from "react";
import {
  Button,
  Text,
} from "react-native-paper";
import {
  View,
  ImageBackground,
  Modal
} from "react-native";

export default function WriteToken(props){

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
              justifyContent:'center',
              alignItems:'center',
              height:'100%',
              width:'100%'
            }}
          >
              <Text style={{
                  fontSize:20
              }}>
                Write the following code on the File:
              </Text>
              <Text style={{
                  marginTop: '5%',
                  fontSize:50,
                  fontWeight:'bold'
              }}>
                {props.token}
              </Text>
              <Button
                mode="contained"
                color="black"
                style={{
                    marginTop:'20%',
                    padding:10,
                    paddingHorizontal:20
                }}
                onPress = {
                    ()=>{
                      props.navigation.reset({
                        index: 0,
                        routes: [{
                          name: "Home",
                        }],
                      });
                    }
                }
              >
                Done
              </Button>
          </View>
        </ImageBackground>
      </Modal>
    )
}