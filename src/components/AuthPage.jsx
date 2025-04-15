import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function AuthPage() {

    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    async function signIn() {
        await signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                navigate('/chatbox');
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(errorCode + '\n' + errorMessage + '\n' + email + '\n' + credential);
            });
    }

    return (
        <button
            id="signIn"
            className="bg-white text-2xl flex items-center cursor-pointer hover:scale-105 active:opacity-50 transition ease-in-out duration-300 border shadow-xl p-5 rounded-full"
            onClick={signIn}
        >
            <img src="\icons8-google.svg" alt="Google Icon" className="w-20 h-20" />
            <span>Sign In With Google</span>
        </button>
    )
}
export default AuthPage