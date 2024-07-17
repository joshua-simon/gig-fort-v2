import { FC } from 'react'
import { StyleSheet,View,Text,TouchableOpacity } from 'react-native'
import GigMap from '../components/Map'
import { mapProps } from '../routes/homeStack'
import Footer from '../components/Footer'

const Map = () => {
    return (
        <View>
            <GigMap/>
            <Footer/>
        </View>
    )
}

export default Map