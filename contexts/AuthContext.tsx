import { createContext, useContext, View } from 'react'
import { useState } from 'react'


// This is the context that will be used to store the user's authentication state.
const AuthContext = createContext()

// This is the provider that will be used to wrap the entire application.
export const AuthProvider = ({ children }) => { 
    const [userData, setUserData] = useState(null)
    
    return (
        <AuthContext.Provider value={{userData, setUserData}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

