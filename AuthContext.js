import { createContext,useEffect,useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user,setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            setUser(user);
        })
    },[])

    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    )

}