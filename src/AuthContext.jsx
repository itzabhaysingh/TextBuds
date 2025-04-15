import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'

const AuthContext = createContext();

function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState({});
    const [chatmsgs, setChatmsgs] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        })
        return () => {
            unsubscribe();
        }
    }, [])

    return (
        <AuthContext.Provider value={{ currentUser, chatmsgs, setChatmsgs }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export { AuthProvider, useAuthContext };