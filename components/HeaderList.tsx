import { useState } from "react";
import { View, Text,TouchableOpacity } from "react-native"
import Feather from '@expo/vector-icons/Feather';
import MenuModal from "./MenuModal";


const HeaderList = () => {
    const [ menuModalVisible, setMenuModalVisible ] = useState(false)

    const handleMenuModal = () => {
        setMenuModalVisible(true)
      }

    return (
        <TouchableOpacity
            onPress={handleMenuModal}
        >
            <Feather name="menu" size={24} color='#377D8A' style = {{marginLeft:'90%'}} />
            <MenuModal
              visible={menuModalVisible}
              onClose={() => setMenuModalVisible(false)}
            />
        </TouchableOpacity>
    )
}

export default HeaderList