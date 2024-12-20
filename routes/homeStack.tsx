import { useContext,useEffect, useLayoutEffect } from "react";
import { StatusBar } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigationState, useIsFocused } from '@react-navigation/native';
import List from '../screens/List'
import Map from '../screens/Map'
import GigDetails from "../screens/GigDetails";
import Register from "../screens/Register";
import RegistrationSuccess from "../screens/RegistrationSuccess";
import Profile from "../screens/Profile";
import Login from "../screens/Login";
import EditDetails from "../screens/EditDetails";
import HeaderProfile from "../components/HeaderProfile";
import DeleteAccount from "../screens/DeleteAccount";
import HeaderList from "../components/HeaderList";
import TermsAndConditions from "../components/TermsAndConditions";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import About from "../screens/About";
import { AuthContext } from "../AuthContext";


export interface Time {
  nanoseconds:number
  seconds:number;
}

export interface GigObject {
  tickets:string,
  venue:string,
  dateAndTime: Time,
  isFree:boolean,
  image:string,
  genre: string,
  gigName:string,
  blurb:string,
  id?:string,
  ticketPrice?:string,
  address:string,
  links: string[],
  gigName_subHeader:string,
  location?:{longitude:number,latitude:number},
  genreTags: string[],
}


export interface UserDetails {
  firstName:string,
  lastName:string,
  UID:string
}


export type RootStackParamList = {
  Map:undefined,
  List:undefined,
  GigDetails: GigObject,
  About:undefined,
  Register:undefined, 
  RegistrationSuccess:undefined,
  Profile:undefined,
  Login:undefined,
  EditDetails:UserDetails,
  Header:undefined,
  DeleteAccount:undefined,
  TermsAndConditions: {
    onTermsAccept: (accepted: boolean, navigation: any) => Promise<void>;
  }

}

interface MyStackProps {
  termsAccepted: boolean | null;
  onTermsAccept: (accepted: boolean, navigation: any) => Promise<void>;
  notificationPermission: boolean;
}

const Stack = createStackNavigator<RootStackParamList>()

export type listProps = NativeStackScreenProps<RootStackParamList, 'List', 'MyStack'>
export type mapProps = NativeStackScreenProps<RootStackParamList, 'Map', 'MyStack'>
export type gigDetailsProps = NativeStackScreenProps<RootStackParamList, 'GigDetails', 'MyStack'>
export type registerProps = NativeStackScreenProps<RootStackParamList, 'Register', 'MyStack'>
export type registrationSuccessProps = NativeStackScreenProps<RootStackParamList, 'RegistrationSuccess', 'MyStack'>
export type profileProps = NativeStackScreenProps<RootStackParamList, 'Profile', 'MyStack'>
export type loginProps = NativeStackScreenProps<RootStackParamList, 'Login', 'MyStack'>
export type deleteAccountProps = NativeStackScreenProps<RootStackParamList, 'DeleteAccount', 'MyStack'>
export type editDetailsProps = NativeStackScreenProps<RootStackParamList, 'EditDetails', 'MyStack'>
export type termsProps = NativeStackScreenProps<RootStackParamList, 'TermsAndConditions', 'MyStack'>


export const MyStack = ({termsAccepted, onTermsAccept, notificationPermission  }: MyStackProps) => {

  const { user } = useContext(AuthContext)

  return (
    <Stack.Navigator
        initialRouteName={termsAccepted ? "Map" : "TermsAndConditions"}
    >
    <Stack.Screen 
      name="TermsAndConditions"
      initialParams={{ onTermsAccept }}
      component={TermsAndConditions} 
      options={{
        headerShown: false,
      }}
    />
      <Stack.Screen 
      name="Map" 
      component={Map} 
      options={{
        title:'',
        headerShown: false,
        // headerTitle: () => <Header/>,
        // headerStyle:{
        //   backgroundColor:'#2596be'
        // },
        headerLeft: () => null
    }}     
      />
      <Stack.Screen 
      name="List" 
      component={List} 
      options={{
        title: '',
        headerTitle: () => <HeaderList/>,
        headerTintColor:'#2596be',
        headerStyle:{
          backgroundColor:'#E8E7E6'
        }
    }}
      />
      <Stack.Screen 
      name="GigDetails" 
      component={GigDetails} 
      options={{
        title:'',
        headerTintColor:'black',
        headerStyle:{
          backgroundColor:'#e2dace'
        }
    }}
      />
      <Stack.Screen 
      name="About" 
      component={About} 
      options={{
        title: '',
        headerStyle:{
          backgroundColor:'#F7F6F5'
        }
    }}
      />
      <Stack.Screen 
      name="Register" 
      component={Register} 
      options={{
        title:'',
        headerStyle:{
          backgroundColor:'#F7F6F5'
        }
    }}
    />
      <Stack.Screen 
      name="EditDetails" 
      component={EditDetails} 
      options={{
        title:'',
        headerStyle:{
          backgroundColor:'#F7F6F5'
        }
    }}
    />
    <Stack.Screen 
    name="RegistrationSuccess" 
    component={RegistrationSuccess} 
    options={{
      title:'',
      headerStyle:{
        backgroundColor:'#F7F6F5'
      },
      headerLeft: () => {return null}
  }}
      />
    {user ? (
  
          <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{
            title:'',
            headerTintColor:'white',
            headerTitle: () => <HeaderProfile/>,
            headerStyle:{
              backgroundColor:'#2596be'
            }
        }}
        />
   ): null} 
    <Stack.Screen 
    name="Login" 
    component={Login} 
    options={{
      title:'',
      headerStyle:{
        backgroundColor:'#F7F6F5'
      },
  }}
      />
    <Stack.Screen 
    name="DeleteAccount" 
    component={DeleteAccount} 
    options={{
      title:'',
      headerStyle:{
        backgroundColor:'#F7F6F5'
      },
  }}
      />
    </Stack.Navigator>
  );
};