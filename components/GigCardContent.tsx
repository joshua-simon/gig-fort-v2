import { FC } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Image,Alert } from 'react-native'
import * as Notifications from 'expo-notifications';
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import ButtonBar from './ButtonBar';
import ReminderPopup from './ReminderPopup';
import { GigObject } from '../routes/homeStack';

interface GigCardContentProps {
  item: GigObject;
  dayOfMonth: number;
  monthName: string;
  navigation?: any;
  user:any;
  toggleSaveGig:any;
  isGigSaved:any;
  likes:any;
  isGigLiked: any;
  toggleLiked: any;
  isNotified: any;
  showReminderPopup: any;
  hideReminderPopup: any;
  isPopupVisible: any;
  isReminderPopupVisible: any;
  cancelNotificationForGig: any;
  setNotification: any;
  permissionStatus: string | null;
}

const GigCardContent:FC<GigCardContentProps> = ({ 
  item,
  dayOfMonth,
  monthName,
  toggleSaveGig,
  isGigSaved,
  navigation,
  user,
  likes,
  isGigLiked,
  toggleLiked,
  isNotified,
  showReminderPopup,
  hideReminderPopup,
  isPopupVisible,
  isReminderPopupVisible,
  cancelNotificationForGig,
  setNotification,
  permissionStatus
}) => {

  const handleReminderPress = async () => {
    // If already notified, just cancel it
    if (isNotified) {
      cancelNotificationForGig();
      return;
    }
  
    // Check permission status and handle accordingly
    if (permissionStatus === 'denied') {
      Alert.alert(
        'Notifications Disabled',
        'To set reminders for gigs, you need to enable notifications in your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
      return;
    }
  
    if (permissionStatus === null || permissionStatus === 'undetermined') {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'To receive gig reminders, please allow notifications when prompted.',
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return;
      }
    }
  
    // If we get here, we either already had permission (permissionStatus === 'granted')
    // or just got permission from the user
    showReminderPopup();
  };

  const gigTitle =
  item?.gigName.length > 30
    ? `${item?.gigName.substring(0, 30)}...`
    : item?.gigName;

  const gigFortLogoURL = 'https://play-lh.googleusercontent.com/bTmOoSUdABDQ2rAa80DPOgyHbZH-4YVoIbDtuJfEK47Tfjx3WutZ9RcUiP8jKugxtXKO=w240-h480-rw'

  const content =  
    <View style={styles.gigCard_items}>
      <View style = {{flexDirection:'row',justifyContent:'space-between'}}>
        <View style = {{flexDirection:'column'}}>
          <Text style={styles.gigCard_header}>{gigTitle.length > 23 ? `${gigTitle.substring(0,22)}...` : gigTitle }</Text>
          {/* {notificationPopup} */}
          <View style={styles.venueDetails}>
            <Ionicons name="location-outline" size={14} color="black" />
            <Text style={styles.gigCard_details}>
            {item?.venue.length > 20 ? `${item?.venue.substring(0, 20)}...` : item?.venue} | {item?.genre.length > 20 ? `${item?.genre.substring(0, 20)}...` : item?.genre}
            </Text>
          </View>
        </View>
          <View style = {styles.dateBox}>
            <Text style = {styles.dateBox_day}>{dayOfMonth}</Text>
            <Text style = {styles.dateBox_month}>{monthName}</Text>
          </View>
      </View>
      <View style={styles.imageAndBlurb}>
        { item.image ? <Image style={styles.gigCard_items_img} source={{ uri: item?.image }} /> :<Image style={styles.gigCard_items_img} source={{ uri: gigFortLogoURL }} />}
        <Text style={styles.blurbText}>{`${item?.blurb.substring(
          0,
          60
        )}...`}</Text>
      </View>
      <View style = {styles.recommendations_container}>
        <View style={styles.recommendations}>
          <Text style={styles.recommendations_text}>{`  ${likes} ${
            likes == 1 ? "person has" : "people have"
          } liked this gig`}</Text>
        </View>
      <TouchableOpacity
          onPress={() => {
            try {
              navigation.navigate("GigDetails", {
                venue: item?.venue,
                gigName: item?.gigName,
                blurb: item?.blurb,
                isFree: item?.isFree,
                image: item?.image,
                genre: item?.genre,
                dateAndTime: { ...item?.dateAndTime },
                tickets: item?.tickets,
                ticketPrice: item?.ticketPrice,
                address: item?.address,
                links: item?.links,
                gigName_subHeader: item?.gigName_subHeader,
                id: item?.id,
              })
            } catch ( error ) {
              console.error('Error during navigation:', error);
            }
          }
          }
        >
          <Text style={styles.seeMore}>See more {`>`}</Text>
        </TouchableOpacity>
      </View>
    {user ? (
            <View style={styles.saveAndNotificationButtons}>
            <View style={styles.saveAndNotificationButtons_button}>
              <TouchableOpacity onPress={() => toggleLiked(item?.id)}>
                {isGigLiked ? (
                  <AntDesign name="heart" size={24} color="#377D8A" />
                ) : (
                  <AntDesign name="hearto" size={24} color="#377D8A" />
                )}
              </TouchableOpacity>
              <Text style={styles.saveAndNotificationButtons_button_text}>
                Like
              </Text>
            </View>
    
            <View style={styles.saveAndNotificationButtons_button}>
              <TouchableOpacity onPress={() => toggleSaveGig(item?.id)}>
                {isGigSaved ? (
                  <FontAwesome name="bookmark" size={24} color="#377D8A" />
                ) : (
                  <FontAwesome name="bookmark-o" size={24} color="#377D8A" />
                )}
              </TouchableOpacity>
              <Text style={styles.saveAndNotificationButtons_button_text}>
                Save
              </Text>
            </View>

            <View style={styles.saveAndNotificationButtons_button}>
              <TouchableOpacity onPress={handleReminderPress}>
                <Ionicons 
                  name={isNotified ? "notifications-sharp" : "notifications-outline"} 
                  size={24} 
                  color="#377D8A" 
                />
              </TouchableOpacity>
              <Text style={styles.saveAndNotificationButtons_button_text}>
                {isNotified ? "Cancel Reminder" : "Remind me"}
              </Text>
          </View>
          <ReminderPopup 
            isVisible={isReminderPopupVisible}
            onClose={hideReminderPopup}
            onApply={(minutes) => {
              setNotification(minutes);
              hideReminderPopup();
        }}
      />
          </View>
    ) : (
      <ButtonBar/>
    )}
    </View>

 return <View>{content}</View>

}

const styles = StyleSheet.create({
  header: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 15,
  },
  touchable: {
    padding: 6,
  },
  gigCard_header: {
    fontFamily: "NunitoSans",
    fontSize: 18,
    lineHeight: 24.55,
  },
  gigCard_details: {
    fontFamily: "LatoRegular",
    color: "#000000",
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17.04,
  },
  venueDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    paddingLeft: 10,
    fontFamily: "Sofia-Pro",
    fontSize: 20,
    textDecorationLine: "underline",
  },
  gigCard_items: {
    flexDirection: "column",
  },
  gigCard_items_img: {
    height: 85.63,
    width: 100,
    borderRadius: 8,
    marginRight: "3%",
  },
  imageAndBlurb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    transform: [{ translateY: 15 }],
    marginBottom: 20,
  },
  seeMore: {
    textAlign: "right",
    fontFamily: "LatoRegular",
    fontSize: 12,
    lineHeight: 17.04,
    color: "#377D8A",
  },
  blurbText: {
    flex: 1,
    fontFamily: "LatoRegular",
    // size: 10,
    lineHeight: 14.2,
  },

  recommendations: {
    flexDirection: "column",
  },
  recommendations_text: {
    fontFamily: "LatoRegular",
    color: "#747474",
    // marginTop: "2%",
    // marginBottom: "1%",
  },
  recommendations_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "1%"
  },
  saveAndNotificationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "2%",
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#D3D3D3",
  },
  saveAndNotificationButtons_button: {
    flexDirection: "column",
    alignItems: "center",
  },
  saveAndNotificationButtons_button_text: {
    // textAlign:'right',
    fontFamily: "LatoRegular",
    fontSize: 12,
    lineHeight: 17.04,
    color: "#377D8A",
  },
  dateBox: {
    width:42,
    height:40,
    flexShrink:0,
    borderRadius:4,
    backgroundColor:'#659AA3',
    alignItems:'center',
  },
  dateBox_day:{
  fontFamily:'NunitoSans',
  fontSize:16,

  },
  dateBox_month:{
    fontFamily:'NunitoSans',
    fontSize:12,
  }
});
 
export default GigCardContent;