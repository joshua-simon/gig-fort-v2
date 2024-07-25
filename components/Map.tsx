import { FC,useState,useMemo,useEffect,useContext,useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Dimensions,
    Button,
    StatusBar,
    TouchableOpacity
  } from "react-native";
  import { Marker,Callout } from "react-native-maps";
import { mapStyle } from "../util/mapStyle.js";
import { useGigs } from "../hooks/useGigs";
import { format,isSameDay } from "date-fns";
import { mapProps } from "../routes/homeStack";
import { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import Carousel from "./Carousel";
import ClusteredMapView from 'react-native-maps-super-cluster';
import { Entypo } from '@expo/vector-icons';
import { AuthContext } from "../AuthContext";
import { useGetUser } from "../hooks/useGetUser";
import { useLocation } from "../LocationContext";
import { useFocusEffect } from '@react-navigation/native';
// import CustomCallout from "./CustomCallout";

const GigMap = () => {

    const wellingtonRegion = {
        latitude: -41.29416,
        longitude: 174.77782,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }


    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                {/* <ClusteredMapView
                    style = {styles.map}
                    region = {wellingtonRegion}
                    customMapStyle={mapStyle}
                    provider={PROVIDER_GOOGLE}
                >
                </ClusteredMapView> */}
            </View>
            <Text>GigMap</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex:1,
    },
    map: {
      height: '100%',
      width: '100%',
      flex:1,
      ...Platform.select({
        android: {
          overflow: 'hidden',
          borderRadius:26,
          elevation: 4,
        }
      })
    },
    marker: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    markerText: {
      color: 'black',
      fontWeight: 'bold',
      fontSize: 14,
      fontFamily:'LatoRegular'
    },
    mapContainer:{
      marginTop: 0,
      flex:1,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
        },
        android: {
          overflow: 'hidden',
          elevation: 4,
        }
      })
    },
    gigInfo_text: {
      fontSize:10,
      color:'black',
      fontFamily:'NunitoSans',
      paddingTop: 25,
      textAlign:'center',
      fontWeight:'bold'
    },
    gigInfo_text_genre: {
      color: "white",
      fontFamily: "Helvetica-Neue",
      transform: [{ translateY: -5 }],
    },
    mapElements_container:{
      flexDirection:'row',
      backgroundColor: 'rgba(55, 125, 138,0.8)',
      alignSelf: 'flex-start',
      padding:'3%',
      borderRadius:8
    },
    headerText_main: {
      fontFamily: "NunitoSans",
      fontSize:25,
      lineHeight:34.1,
      color:'white',
      marginLeft:'7%'
    },
    headerText_sub: {
      fontFamily:'LatoRegular',
    //   size:14,
      lineHeight:16.8,
      color:'white',
      marginLeft:'7%'
    },
    callout: {
      width: 160,
      height: 'auto'
    },
    callout_gigName:{
      fontFamily:'NunitoSans',
      color:'#FFFFFF',
      width:'auto'
    },
    buttonOptions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width:'100%',
      position: 'absolute',
      top: '80%', 
      left: 0, 
      right: 0, 
      zIndex: 1,
      padding:'2%'
    },
    buttonOptionsText: {
      margin: 5,
    },
    image: {
      height:20,
      width:14,
      marginHorizontal:3
    },
    imageMain: {
      height:42,
      width:30,
      marginHorizontal:3, 
  
    },
    imageText: {
      flexDirection: "row",
      marginLeft:'7%',
      marginTop:27
    },
    touchable: {
      flexDirection: "column",
      alignItems: "center",
    },
    subHeader: {
      fontFamily: "LatoRegular",
      color: "#747474",
    //   size: 12,
      lineHeight: 17.04,
    },
    button:{
      flexDirection:'column',
      width:115,
      height:37,
      marginLeft:'7%',
      backgroundColor:'#377D8A',
      borderRadius:8,
      justifyContent:'center',
      marginTop:'6%'
    },
    buttonText: {
      color:'#FFFFFF',
      textAlign:'center',
      fontFamily: 'NunitoSans',
      fontSize:16,
      lineHeight:22
    },
    buttonAndSwitch:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      marginBottom:'6%'
    },
    switch:{
      marginRight:'7%',
      zIndex:0,
    },
    switch_text: {
      fontFamily: 'LatoRegular',
      fontSize:10,
    },
    mapElements: {
      flexDirection: 'column',
      position: 'absolute',
      top: 10,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    mapElements_top:{
      flex: 1,
    },
    clusterContainer: {
      width: 30,
      height: 30,
      borderWidth: 1,
      borderRadius: 15,
      alignItems: 'center',
      borderColor: '#65a8e6',
      justifyContent: 'center',
      backgroundColor: '#65a8e6',
    },
    clusterText: {
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold',
    },
  });
  

export default GigMap