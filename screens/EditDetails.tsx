import { FC,useState,useContext } from "react";
import { View, Text,TextInput,Button,StyleSheet,TouchableOpacity } from "react-native";
import { AuthContext } from "../AuthContext";
import { useGetUser } from "../hooks/useGetUser";
import { editDetailsProps } from "../routes/homeStack";
import { updateUserDetails } from "../hooks/databaseFunctions";
import { buttonFilled,buttonFilled_text} from "../styles";
import { Picker } from "@react-native-picker/picker";

type EditDetailsScreenProp = editDetailsProps['route']
type EditDetailsNavigationProp = editDetailsProps['navigation']

interface Props {
    route:EditDetailsScreenProp,
    navigation:EditDetailsNavigationProp
}

const EditDetails:FC<Props> = ({ route,navigation }) => {

    const { user } = useContext(AuthContext)
    const UID = user.uid
    const userDetailsFromHook = useGetUser(user?.uid);
    const { firstName, lastName } = userDetailsFromHook || {};
    const [ userDetails, setUserDetails ] = useState({updatedFirstName:firstName,updatedLastName:lastName,location:'Wellington'})
    const [errorMessages,setErrorMessages] = useState<Record<string,string>>({})

    

    const handleChange = (name:string,value:string) => {
        setUserDetails({...userDetails,[name]:value})
        setErrorMessages({...errorMessages,[name]:''})  
    }

    const validateForm = () => {
        let isValid = true
        const error:Record<string,string> = {}

        if(userDetails.updatedFirstName.trim() === '') {
            error.firstName = 'Please do not leave this field empty'
            isValid = false
        }
        if(userDetails.updatedLastName.trim() === '') {
            error.lastName = 'Please do not leave this field empty'
            isValid = false
        }    
        setErrorMessages(error)
        return isValid
    }

  const handleSubmit = () => {
    if (validateForm()){
        updateUserDetails(userDetails.updatedFirstName,userDetails.updatedLastName,UID)
        navigation.navigate('Profile')
        alert('Details updated')
    }
}

    return (
        <View style = {styles.container}>
            <Text style = {styles.header}>Edit details</Text>
            <TextInput 
                placeholder={firstName}
                defaultValue={firstName}
                value={userDetails.updatedFirstName}
                style={styles.input}
                onChangeText={(text) => handleChange('updatedFirstName',text)}
            />
            {errorMessages.firstName ? <Text style={{ color: 'red' }}>{errorMessages.firstName}</Text> : null}
            <TextInput 
                placeholder={lastName}
                value={userDetails.updatedLastName}
                defaultValue={lastName}
                style={styles.input}
                onChangeText={(text) => handleChange('updatedLastName',text)}
            />
            {errorMessages.lastName ? <Text style={{ color: 'red' }}>{errorMessages.lastName}</Text> : null}
            <TouchableOpacity style={buttonFilled} onPress={handleSubmit}>
              <Text style={buttonFilled_text}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
container: {
    flex: 1, 
    alignItems: "center",
    justifyContent: "center",     
    },
header: {
    fontFamily: "NunitoSans",
    fontSize:20,
    marginBottom:10
},
input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5, 
    padding: 10,
    marginBottom: 10,
    width: '80%',
    fontFamily:"LatoRegular"
  },

})
 
export default EditDetails;