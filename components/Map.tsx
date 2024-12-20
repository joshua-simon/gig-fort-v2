import { FC,useState,useMemo,useEffect,useContext,useCallback,useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Linking
} from "react-native";
import { Marker,Callout } from "react-native-maps";
import { mapStyle } from "../util/mapStyle";
import { useGigs } from "../hooks/useGigs";
import { format,isSameDay } from "date-fns";
import { mapProps } from "../routes/homeStack";
import { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import ClusteredMapView from 'react-native-maps-super-cluster';
import { Entypo } from '@expo/vector-icons';
import { AuthContext } from "../AuthContext";
import { useGetUser } from "../hooks/useGetUser";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomModal from "./CustomModal";
import MenuModal from "./MenuModal";
import DatePicker from "./DatePicker";


type MapScreenNavgationProp = mapProps['navigation']

interface Props {
    navigation: MapScreenNavgationProp
}

const GigMap:FC<Props> = ({ navigation }):JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ gigs, setGigs ] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [ menuModalVisible, setMenuModalVisible ] = useState(false)
  const [customFiltersApplied, setCustomFiltersApplied] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const {user} = useContext(AuthContext) || {}
  const userDetails = useGetUser(user?.uid);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);


    //This hook retrieves user's location
    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasLocationPermission(true);
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);
        } else {
          setErrorMsg('Permission to access location was denied');
          setHasLocationPermission(false);
        }
      })();
    }, []);

    const { 
      gigsDataFromHook, 
      isLoading, 
      error, 
      filterByProximity, 
      filterByStartTime,
      applyCustomFilters, 
      resetFilter,
      isNearMeActive,
      isStartingSoonActive
    } = useGigs({
      userLatitude: location?.coords.latitude,
      userLongitude: location?.coords.longitude,
    });

    const handleNearMePress = () => {
      filterByProximity();
    };
  
    const handleStartingSoonPress = () => {
      filterByStartTime();
    };

    useEffect(() => {
      if (appliedFilters) {
        applyCustomFilters(appliedFilters);
      }
    }, [appliedFilters, applyCustomFilters]);

    const handleFilterButtonPress = () => {
      if (customFiltersApplied) {
        // Clear filters
        resetFilter();
        setCustomFiltersApplied(false);
      } else {
        // Open modal
        setModalVisible(true);
      }
    };
  
    const handleApplyFilters = (filters) => {
      applyCustomFilters(filters);
      setCustomFiltersApplied(true);
      setModalVisible(false);
    };

    const handleMenuModal = () => {
      setMenuModalVisible(true)
    }

    const formatDateForDisplay = (date: Date): string => {
      if (isSameDay(date, new Date())) {
        return `Today, ${format(date, 'do MMMM')}`;
      }
      return format(date, 'EEE do MMMM');
    };
  
    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setDatePickerVisible(false);
  
    };
  

  useEffect(() => {
    if (gigsDataFromHook) {
      setGigs(gigsDataFromHook);
    }
  }, [gigsDataFromHook]);


  //Filtering through gigs to return only current day's gigs
  const gigsToday = gigs?.filter((gig) => {
    const gigDate = new Date(gig?.dateAndTime?.seconds * 1000)
    return isSameDay(gigDate, selectedDate);
  });

  const gigsData = gigsToday?.map((gig) => ({
    coordinate: {
      latitude: gig.location.latitude,
      longitude: gig.location.longitude,
    },
    ...gig,
  })) || [];



  const groupedByVenue = {};

  gigsData.forEach(gig => {
      if (groupedByVenue[gig.venue]) {
          groupedByVenue[gig.venue].push(gig);
      } else {
          groupedByVenue[gig.venue] = [gig];
      }
  });

  const venuesData = Object.keys(groupedByVenue).map(venue => ({
    venue,
    gigs: groupedByVenue[venue],
    location: groupedByVenue[venue][0].coordinate 
}));

// RENDER MARKER ---------------------------------------------------------------//

const renderMarker = (data) => {
  const { venue, gigs } = data;
  const primaryGig = gigs[0]; 


  if (gigs.length === 1) {
    return (
      <Marker
        anchor={{ x: 0.5, y: 0.5 }} 
        key={primaryGig.id}
        coordinate={{
          latitude: primaryGig.location.latitude,
          longitude: primaryGig.location.longitude
        }}
        onPress={() => {
          navigation.navigate("GigDetails", {
            venue: primaryGig.venue,
            gigName: primaryGig.gigName,
            image: primaryGig.image,
            blurb: primaryGig.blurb,
            isFree: primaryGig.isFree,
            genre: primaryGig.genre,
            dateAndTime: { ...primaryGig.dateAndTime },
            ticketPrice: primaryGig.ticketPrice,
            tickets: primaryGig.tickets,
            address: primaryGig.address,
            links: primaryGig.links,
            gigName_subHeader: primaryGig.gigName_subHeader,
            id: primaryGig.id,
            genreTags: primaryGig.genreTags
          });
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image style={styles.imageMain} source={require('../assets/map-pin-new.png')}/>
          <Text style={styles.markerText}>
            {primaryGig.genre.length > 10 ? `${primaryGig.genre.substring(0, 10)}...` : primaryGig.genre}
          </Text>
        </View>
      </Marker>
    );   
  } 

  else {
    return (
      <Marker
        anchor={{ x: 0.5, y: 0.5 }}
        key={venue}
        coordinate={{
          latitude: primaryGig.location.latitude,
          longitude: primaryGig.location.longitude
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image style={styles.imageMain} source={require('../assets/map-pin-new.png')}/>
          <Text style={styles.markerText}>
            {venue.length > 10 ? `${venue.substring(0, 10)}...` : venue}
          </Text>
        </View>

        <Callout  style = {{width:150, height:'auto'}}>
          <View style = {styles.callout}>
            {data.gigs.map((gig,i) => {

              const date = new Date(gig.dateAndTime.seconds*1000)
              const formattedDate = format(date, 'h:mm a')

              return (
                <TouchableOpacity style = {{zIndex:2}}  key={gig.id} onPress={() => {
                  navigation.navigate("GigDetails", {
                    venue: gig.venue,
                    gigName: gig.gigName,
                    image: gig.image,
                    blurb: gig.blurb,
                    isFree: gig.isFree,
                    genre: gig.genre,
                    dateAndTime: { ...gig.dateAndTime },
                    ticketPrice: gig.ticketPrice,
                    tickets: gig.tickets,
                    address: gig.address,
                    links: gig.links,
                    gigName_subHeader: gig.gigName_subHeader,
                    id: gig.id,
                    genreTags: gig.genreTags                
                  });
                }}>
                  <View style = {{backgroundColor:'#377D8A',borderRadius:4,marginBottom:'5%',padding: '2%',width:'auto'}}>
                    <Text style = {styles.callout_gigName}>{gig.gigName.length > 20 ? `${gig.gigName.substring(0,21)}... - ${formattedDate}`: `${gig.gigName} - ${formattedDate}`}</Text>
                  </View>
                </TouchableOpacity>              
              )
              })}
          </View>
          <Text style = {{fontFamily:'LatoRegular',fontStyle:'italic'}}>Find gigs on the 'List' view for more details</Text>
        </Callout>

      </Marker>
    );
  }
};

// RENDER MARKER ---------------------------------------------------------------//


  const renderCluster = (cluster, onPress) => (
    <Marker coordinate={cluster.coordinate} onPress={onPress}>
      <View style={styles.clusterContainer}>
        <Text style={styles.clusterText}>{cluster.pointCount}</Text>
      </View>
    </Marker>
  );


  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  let userMarker = null;
  if (location) {
    userMarker = (
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="You are here"
        // icon = {icon}
        anchor={{ x: 0.5, y: 0.5 }} 
      >
        <Entypo name="dot-single" size={60} color="#4A89F3" />
      </Marker>
    );
  }

  const wellingtonRegion = {
    latitude: -41.29416,
    longitude: 174.77782,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  }


  const [mapRegion, setMapRegion] = useState(wellingtonRegion);


  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.mapElements}>
      </View>
      <View style={styles.mapContainer}>
        <ClusteredMapView
          region={mapRegion}
          style={styles.map}
          data={venuesData}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE}
          renderMarker={renderMarker} // Custom rendering for markers
          renderCluster={renderCluster} // Custom rendering for clusters
          scrollEnabled={!isPanelVisible}
          zoomEnabled={!isPanelVisible}
        >
          {userMarker}
        </ClusteredMapView>
        <Text style={styles.overlayText}>Powered by <Text style ={styles.overlayText_link} onPress={() => Linking.openURL('https://www.eventfinda.co.nz/')}>Eventfinda</Text></Text>
      </View>
      <View style={styles.overlay}>
        <View style={styles.overlay_header}>
          <Image
            source={require("../assets/Icon_White_48x48_new.png")}
            style={{ width: 12, height: 28, marginBottom: 4 }}
          />
          <TouchableOpacity
            style={styles.overlay_button}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.overlay_button_text}>{formatDateForDisplay(selectedDate)}{" "}</Text>
            <AntDesign name="caretdown" size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMenuModal}
          >
            <Feather name="menu" size={24} color="white" style={{ paddingTop: "5%" }} />
          </TouchableOpacity>
        </View>
        <View style={styles.overlay_buttons}>
          <View style={styles.overlay_buttons_filters}>
            {hasLocationPermission ? (
              <TouchableOpacity
                style={[
                  styles.overlay_buttons_filters_button,
                  isNearMeActive && styles.overlay_buttons_filters_button_active
                ]}
                onPress={handleNearMePress}
              >
                <View style={styles.overlay_buttons_filters_button_details}>
                  <Feather name="map-pin" size={12} color="white" />
                  <Text style={styles.overlay_buttons_filters_button_text}> Near me</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.overlay_buttons_filters_button,
                ]}
                onPress={() => alert('Please allow Gig Fort access to your location in order to use distance-based filters')}
              >
                <View style={styles.overlay_buttons_filters_button_details}>
                  <Feather name="map-pin" size={12} color="white" />
                  <Text style={styles.overlay_buttons_filters_button_text}> Near me</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.overlay_buttons_filters_button,
                isStartingSoonActive && styles.overlay_buttons_filters_button_active
              ]}
              onPress={handleStartingSoonPress}
            >
              <View style={styles.overlay_buttons_filters_button_details}>
                <AntDesign name="clockcircleo" size={12} color="white" />
                <Text style={styles.overlay_buttons_filters_button_text}> Starting soon</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFilterButtonPress}
              style={[
                styles.overlay_buttons_filters_button,
                customFiltersApplied && styles.activeFilterButton
              ]}
            >
              <View style={styles.overlay_buttons_filters_button_details}>
                <Feather name="sliders" size={12} color="white" />
                <Text style={styles.overlay_buttons_filters_button_text}>
                  {customFiltersApplied ? " Clear Filters" : " Custom Filters"}
                </Text>
              </View>
            </TouchableOpacity>
            <CustomModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onApply={handleApplyFilters}
              hasLocationPermission={hasLocationPermission}
            />
            <MenuModal
              visible={menuModalVisible}
              onClose={() => setMenuModalVisible(false)}
            />
          </View>
        </View>
        <DatePicker
          isVisible={isDatePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </View>
    </View>
  );
};

const {width:screenWidth, height:screenHeight} = Dimensions.get('window')
const mapWidth = screenWidth * 0.9 //this sets width to 90%
const mapHeight = mapWidth /0.91 //this set height  based on the figma map aspect ratio of 0.91


const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 85, 
    zIndex: 1000,
    backgroundColor:'rgba(55, 125, 138, 0.7)'
  },
  overlay_header: {
    height:'85%',
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems:'flex-end',
    paddingHorizontal: 15
  },
  overlay_buttons:{
    marginTop: "-2%",
    position: 'absolute',
    top: 80, // Position it right below the header
    left: 0,
    right: 0,
    paddingTop: 10
  },
  overlay_button: {
    flexDirection:'row',
    borderRadius: 18,
    alignItems: 'center',
    width:"60%",
  },
  overlay_button_text: {
    color:'#FFFFFF',
    textAlign:'center',
    fontFamily: 'NunitoSans',
    fontSize:18,
    alignItems:'center',
  },
  overlay_buttons_filters: {
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  overlay_buttons_filters_button:{
    backgroundColor:'rgba(55, 125, 138, 0.9)',
    // borderWidth: 1,
    // borderColor: 'white',
    padding: 6,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    width:"auto",
    marginTop:15,
    alignSelf:"center"
  },
  overlay_buttons_filters_button_details: {
    flexDirection: 'row',
    alignItems: "center"
  },
  overlay_buttons_filters_button_text: {
    color:'white',
    textAlign:'center',
    fontFamily: 'NunitoSans',
    fontSize:14,
    lineHeight:22,
    paddingRight:1,
  },
  overlay_buttons_filters_button_active: {
    backgroundColor: '#2596be', 
  },
  activeFilterButton: {
    backgroundColor: '#00AFDD',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
    size:14,
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
    size: 12,
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
  overlayText: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    zIndex: 1,
    color: '#377D8A',
    padding: 5,
    borderRadius: 5,
    fontFamily: 'LatoRegular'
  },
  overlayText_link: {
    color:'#377D8A',
    textDecorationLine:'underline',
    fontFamily: 'LatoRegular'
  }
});

export default GigMap;