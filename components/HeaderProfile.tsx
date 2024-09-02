import { FC, useContext,useState } from "react";
import { StyleSheet, View, Text, Button, Modal,TouchableOpacity, ActivityIndicator,Platform } from "react-native";
import { Feather } from '@expo/vector-icons'; 
import MenuModal from "./MenuModal";
import { buttonFilled,buttonFilled_text,buttonTextOnly,buttonTextOnly_text } from "../styles";


const HeaderProfile: FC = (): JSX.Element => {
  const [ menuModalVisible, setMenuModalVisible ] = useState(false)

  return (
    <View style={ Platform.OS === "ios" ? styles.iosStyle_container : styles.container}>
      <TouchableOpacity
        onPress = {() => setMenuModalVisible(true)}
      >
          <Feather name="menu" size={24} color="white" style={{ paddingTop: "3%" }} />
      </TouchableOpacity>
      <MenuModal
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  button: {
    flexDirection: "column",
    width: 45,
    height: 25,
    marginRight: 10,
    backgroundColor: "#377D8A",
    borderRadius: 8,
    justifyContent: "center",
  },
  buttonText: buttonFilled_text,
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    flex:1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%"
  },
  iosStyle_container:{
    flex:1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    marginLeft:'20%' 
  },
  firstName: {
    fontFamily: "LatoRegular",
  },
  profile: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  menuOption: {
    fontFamily: "NunitoSans",
    fontSize: 16,
    padding:5
  },
  modalContainer: {
    flex: 1, 
    alignItems: "center",
     justifyContent: "center"
  },
  modalHeader: {
    fontFamily: "NunitoSans",
    fontSize:20,
    marginBottom:10
  },
  reminderPopup: {
    position:'absolute',
    left:'20%', 
    color:"white", 
    backgroundColor:"rgba(0,0,0,1)",
    fontFamily:'LatoRegular',
    fontSize:14,
    padding:'3%',
    borderRadius:8
  },
  submitButton: buttonFilled,
  returnToProfileButton: buttonTextOnly,
  returnToProfileText: buttonTextOnly_text
    
});

export default HeaderProfile;