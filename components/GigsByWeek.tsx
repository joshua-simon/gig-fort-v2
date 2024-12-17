import { FC, memo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
import { listProps } from "../routes/homeStack";
import { GigObject } from "../routes/homeStack";
import GigCard from "./GigCard";

type ListScreenNavigationProp = listProps["navigation"];

export interface IGroupedGigs {
  [date: string]: Array<GigObject>;
}

interface Props {
  gigsThisWeek_grouped: IGroupedGigs;
  navigation: ListScreenNavigationProp;
}

// Memoized GigCard wrapper to prevent unnecessary re-renders
const MemoizedGigCard = memo(({ item, navigation }: { item: GigObject; navigation: any }) => (
  <View style={styles.gigCard}>
    <GigCard item={item} navigation={navigation} />
  </View>
));

// Memoized day section component
const DaySection = memo(({ date, gigs, navigation }: { 
  date: string; 
  gigs: GigObject[]; 
  navigation: ListScreenNavigationProp;
}) => {
  const day = date?.slice(0, 3);
  const week = date?.slice(4, 18);

  return (
    <View>
      <View style={styles.date}>
        <Text style={styles.headerText_main}>{day}</Text>
        <Text style={styles.headerText_sub}>{week}</Text>
      </View>

      {gigs.map((gig: GigObject) => (
        <MemoizedGigCard key={gig.id} item={gig} navigation={navigation} />
      ))}
    </View>
  );
});

const GigsByWeek: FC<Props> = ({
  gigsThisWeek_grouped,
  navigation,
}): JSX.Element => (
  <View style={styles.container}>
    <ScrollView>
      {Object.entries(gigsThisWeek_grouped).map(([date, gigs]) => (
        <DaySection 
          key={date} 
          date={date} 
          gigs={gigs} 
          navigation={navigation} 
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: 600,
    paddingBottom: 80
  },
  gigCard: {
    marginLeft: "5%",
    marginRight: "5%",
    backgroundColor: "#FAF7F2",
    height: "auto",
    marginBottom: 16,
    padding: "3%",
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  date: {
    marginLeft: "7%",
    marginBottom: "3%",
  },
  headerText_main: {
    fontFamily: "NunitoSans",
    fontSize: 25,
    lineHeight: 34.1,
  },
  headerText_sub: {
    fontFamily: "LatoRegular",
    lineHeight: 16.8,
  }
});

export default memo(GigsByWeek);