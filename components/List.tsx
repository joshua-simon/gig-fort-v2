import { FC, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Linking } from "react-native";
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
  const [isWeeklyLoading, setIsWeeklyLoading] = useState<boolean>(false);
  const { user } = useContext(AuthContext) || {};
  const userDetails = useGetUser(user?.uid);

  const { gigsDataFromHook, isLoading, error } = useGigs();
  const currentDateMs = useMemo(() => Date.now(), []); // Memoize the current date

  // Memoize the processed gigs data
  const { gigsToday, gigsThisWeek } = useMemo(() => {
    if (!gigsDataFromHook) {
      return { gigsToday: [], gigsThisWeek: {} };
    }
    return {
      gigsToday: getGigsToday(gigsDataFromHook, currentDateMs),
      gigsThisWeek: getGigsThisWeek(gigsDataFromHook, currentDateMs)
    };
  }, [gigsDataFromHook, currentDateMs]);

  // Memoize formatted dates
  const { formattedDay, formattedWeek } = useMemo(() => ({
    formattedDay: format(new Date(currentDateMs), 'EEEE'),
    formattedWeek: format(new Date(currentDateMs), 'LLLL do y')
  }), [currentDateMs]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor('#E8E7E6');
      return () => {};
    }, [])
  );

  const handleWeekPress = useCallback(() => {
    setShowByWeek(true);
  }, []);

  const handleTodayPress = useCallback(() => {
    setShowByWeek(false);
  }, []);

  // Memoize the gigs content
  const gigsContent = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="large" color='#377D8A' />;
    }

    if (showWeek) {
      return Object.keys(gigsThisWeek).length === 0 ? (
        <Text style={{ fontFamily: 'LatoRegular', marginLeft: '7%' }}>No gigs this week</Text>
      ) : (
        <GigsByWeek gigsThisWeek_grouped={gigsThisWeek} navigation={navigation} />
      );
    }

    return gigsToday.length === 0 ? (
      <Text style={{ fontFamily: 'LatoRegular', marginLeft: '7%' }}>No gigs today</Text>
    ) : (
      <GigsByDay navigation={navigation} gigsFromSelectedDate={gigsToday} />
    );
  }, [isLoading, showWeek, gigsThisWeek, gigsToday, navigation]);

  // Memoize the date header
  const dateHeader = useMemo(() => {
    if (showWeek) return null;
    
    return (
      <View testID="gigMapHeader" style={styles.headerText}>
        <Text style={styles.headerText_main}>{formattedDay}</Text>
        <Text style={styles.headerText_sub}>{formattedWeek}</Text>
        <Text style={{fontFamily:'LatoRegular', color:'#377D8A',marginTop:'1%'}}>
          Powered by{' '}
          <Text 
            style={{fontFamily:'LatoRegular', color:'#377D8A',textDecorationLine:'underline'}}
            onPress={() => Linking.openURL('https://www.eventfinda.co.nz/')}
          >
            Eventfinda
          </Text>
        </Text>
      </View>
    );
  }, [showWeek, formattedDay, formattedWeek]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleTodayPress}
          style={!showWeek ? styles.touchable : styles.selected}
        >
          <Text style={!showWeek ? styles.buttonText : styles.buttonTextSelected}>
            Today
          </Text>  
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWeekPress}
          style={showWeek ? styles.touchable : styles.selected}
        >
          <Text style={showWeek ? styles.buttonText : styles.buttonTextSelected}>
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {dateHeader}

      <View style={styles.listContainer}>
        {gigsContent}
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