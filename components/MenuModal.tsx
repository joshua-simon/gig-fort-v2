import { useState,useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../routes/homeStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "../firebase";
import { signOut, deleteUser } from "firebase/auth";
import { AuthContext } from '../AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const MenuModal: React.FC<SimpleModalProps> = ({ visible, onClose }) => {

  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Map">>();
  const { user } = useContext(AuthContext)

  const signUserOut = () => {
    setLoading(true); 
    signOut(auth)
      .then(() => {
        navigation.navigate("Map");
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      })
  };

  const content = user ? (
    <View>
      <TouchableOpacity
        onPress={signUserOut}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.modalTitle}>Sign out</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onClose()
          navigation.navigate("DeleteAccount")
        }}      
      >
        <Text style={styles.modalTitle}>Delete account</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View>
      <TouchableOpacity
        onPress={() => {
          onClose()
          navigation.navigate("Login")
        }}
      >
        <Text style={styles.modalTitle}>Log in</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress = {() => {
          onClose()
          navigation.navigate("Register")
        }}
      >
        <Text style={styles.modalTitle}>Register</Text>
      </TouchableOpacity>
    </View>
  )


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {content}
          <TouchableOpacity  onPress={onClose}>
            <AntDesign name="closecircleo" size={20} color="grey" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MenuModal;