import { FC, useContext, useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, ActivityIndicator,Linking } from "react-native";
import { useGigs } from "../hooks/useGigs";
import GigsByDay from "./GigsByDay";
import GigsByWeek from "./GigsByWeek";
import { listProps } from "../routes/homeStack";
import { getGigsToday, getGigsThisWeek } from "../util/helperFunctions";
import { format } from "date-fns";
import { AuthContext } from "../AuthContext";
import { useGetUser } from "../hooks/useGetUser";
import { useFocusEffect } from '@react-navigation/native';
import { GigObject } from "../routes/homeStack";
import { IGroupedGigs } from "./GigsByWeek";

type ListScreenNavigationProp = listProps["navigation"];

interface Props {
  navigation: ListScreenNavigationProp;
}

const ListByDay: FC<Props> = ({ navigation }): JSX.Element => {
  const [showWeek, setShowByWeek] = useState<boolean>(false);
  const [gigsToday, setGigsToday] = useState<GigObject[]>([]);
  const [gigsThisWeek, setGigsThisWeek] = useState<IGroupedGigs>({});
  const [isWeeklyLoading, setIsWeeklyLoading] = useState<boolean>(false);
  const currentDateMs: number = Date.now();
  const { user } = useContext(AuthContext) || {};
  const userDetails = useGetUser(user?.uid);

  const { gigsDataFromHook, isLoading, error } = useGigs();

  useEffect(() => {
    if (gigsDataFromHook) {
      const today = getGigsToday(gigsDataFromHook, currentDateMs);
      setGigsToday(today);
      
      if (showWeek) {
        setIsWeeklyLoading(true);
        // Simulate a delay for processing weekly data
        setTimeout(() => {
          const thisWeek = getGigsThisWeek(gigsDataFromHook, currentDateMs);
          setGigsThisWeek(thisWeek);
          setIsWeeklyLoading(false);
        }, 0); // Adjust this delay as needed
      }
    }
  }, [gigsDataFromHook, showWeek]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor('#E8E7E6');
      return () => {};  // optional cleanup 
    }, [])
  );

  const formattedDay = format(new Date(currentDateMs), 'EEEE');
  const formattedWeek = format(new Date(currentDateMs), 'LLLL do y');

  const handleWeekPress = () => {
    setShowByWeek(true);
    setIsWeeklyLoading(true);
  };

  const gigsToRender = showWeek ? (
    isWeeklyLoading ? (
      <ActivityIndicator size="large" color='#377D8A' />
    ) : Object.keys(gigsThisWeek).length === 0 ? (
      <Text style={{ fontFamily: 'LatoRegular', marginLeft: '7%' }}>No gigs this week</Text>
    ) : (
      <GigsByWeek gigsThisWeek_grouped={gigsThisWeek} navigation={navigation} />
    )
  ) : (
    gigsToday.length === 0 ? (
      <Text style={{ fontFamily: 'LatoRegular', marginLeft: '7%' }}>No gigs today</Text>
    ) : (
      <GigsByDay navigation={navigation} gigsFromSelectedDate={gigsToday} />
    )
  );

  const showDate = !showWeek ? (
    <View testID="gigMapHeader" style={styles.headerText}>
      <Text style={styles.headerText_main}>{formattedDay}</Text>
      <Text style={styles.headerText_sub}>{formattedWeek}</Text>
      <Text style={{fontFamily:'LatoRegular', color:'#377D8A',marginTop:'1%'}}>Powered by <Text style ={{fontFamily:'LatoRegular', color:'#377D8A',textDecorationLine:'underline'}} onPress={() => Linking.openURL('https://www.eventfinda.co.nz/')}>Eventfinda</Text></Text>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setShowByWeek(false)}
          style={!showWeek ? styles.touchable : styles.selected}
        >
          <Text style={!showWeek ? styles.buttonText : styles.buttonTextSelected}>Today</Text>  
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWeekPress}
          style={showWeek ? styles.touchable : styles.selected}
        >
          <Text style={showWeek ? styles.buttonText : styles.buttonTextSelected}>This Week</Text>
        </TouchableOpacity>
      </View>

      {showDate}

      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color='#377D8A' />
        ) : (
          gigsToRender
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gigCard: {
    marginBottom: 5,
    padding: 12,
    width: "85%",
  },
  header: {
    padding: 10,
  },
  buttonContainer: {
    marginLeft:'7%',
    marginTop:'5%',
    flexDirection:'row',
    justifyContent:'flex-start',
    marginBottom:'10%'
  },
  touchable: {
    padding: 8,
    backgroundColor:'#377D8A',
    borderRadius:8,
    marginRight:'20%'

  },
  selected: {
    padding: 8,
    backgroundColor:'#E8E7E6',
    borderRadius:8,
    marginRight:'20%',
  },
  buttonText: {
  fontFamily: "NunitoSans",
  color:'#FFFFFF',
  textAlign:'center',
  lineHeight: 21.82
  },
  buttonTextSelected: {
    fontFamily: "NunitoSans",
    color:'#377D8A',
    textAlign:'center',
    lineHeight: 21.82
  },
  headerText: {
    color: "black",
    fontSize: 25,
    marginTop: '0%',
    marginLeft: '7%',
    fontFamily: "NunitoSans",
    marginBottom: 10,
  },
  headerText_main: {
    fontFamily: "NunitoSans",
    fontSize:25,
    lineHeight:34.1
  },
  headerText_sub: {
    fontFamily:'LatoRegular',
    fontSize:14,
    lineHeight:16.8
  },
  gigCard_header: {
    fontFamily: "Sofia-Pro",
    fontSize: 17,
  },
  gigCard_details: {
    fontFamily: "Helvetica-Neue",
    color: "#778899",
    flexShrink: 1,
  },
  date: {
    paddingLeft: 10,
    fontFamily: "Sofia-Pro",
    fontSize: 20,
    textDecorationLine: "underline",
  },
  gigCard_items: {
    flexDirection: "row",
    alignItems: "center",
  },
  gigCard_items_img: {
    height: 30,
    width: 30,
  },
  listContainer: {
    marginTop: 20,
    paddingBottom:20
  },
});

export default ListByDay;