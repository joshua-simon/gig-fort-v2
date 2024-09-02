import { useState, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../routes/homeStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { AuthContext } from '../AuthContext';
import { AntDesign } from '@expo/vector-icons';

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
}

const MenuModal: React.FC<SimpleModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Map">>();
  const { user } = useContext(AuthContext);


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
      });
  };

  const renderButton = (title: string, onPress: () => void, isDestructive: boolean = false) => (
    <TouchableOpacity
      style={[styles.button, isDestructive && styles.destructiveButton]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const content = user ? (
    <View style={styles.contentContainer}>
      {renderButton("Edit details", () => {
        onClose();
        navigation.navigate("EditDetails", {
          firstName: user.firstName,
          lastName: user.lastName,
          UID: user.uid,
        });
      })}
      {renderButton(loading ? "Signing out..." : "Sign out", signUserOut)}
      {renderButton("Delete account", () => {
        onClose();
        navigation.navigate("DeleteAccount");
      }, true)}
    </View>
  ) : (
    <View style={styles.contentContainer}>
      {renderButton("Log in", () => {
        onClose();
        navigation.navigate("Login");
      })}
      {renderButton("Register", () => {
        onClose();
        navigation.navigate("Register");
      })}
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {content}
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  contentContainer: {
    alignItems: 'stretch',
  },
  button: {
    backgroundColor: '#377D8A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  destructiveButton: {
    backgroundColor: '#D9534F',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'NunitoSans',
    fontWeight: '600',
  },
});

export default MenuModal;