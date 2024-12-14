import React, { FC } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../routes/homeStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth,db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from 'firebase/firestore';

interface DeleteAccountProps {
    deleteUserAccount: () => void;
}

const DeleteAccount: FC<DeleteAccountProps> = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, "DeleteAccount">>();

    const deleteUserAccount = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
          alert('No user is currently signed in');
          return;
      }

      try {
          // Delete the user document from Firestore
          await deleteDoc(doc(db, "users", currentUser.uid));
          
          // Delete the authenticated user
          await deleteUser(currentUser);
          
          navigation.navigate("Map");
          alert('Your account has been successfully deleted');
      } catch (error) {
          console.error("Error deleting account:", error);
          alert('There was an error deleting your account. Please try again.');
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to delete your account?</Text>
      
      <TouchableOpacity style={styles.deleteButton} onPress={deleteUserAccount}>
        <Text style={styles.buttonText}>Delete my account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'NunitoSans',
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'NunitoSans',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default DeleteAccount;