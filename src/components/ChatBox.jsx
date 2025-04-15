import { signOut } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react'
import { auth, db } from '../firebase';
import { useAuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function ChatBox() {

    const msgRef = useRef();
    const navigate = useNavigate();
    const { currentUser } = useAuthContext();
    const [chatmsgs, setChatmsgs] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const chatContainerRef = useRef(null);

    useEffect(() => {
        getDoc(doc(db, "userMsgs", "msgs")).then((doc) => {
            if (doc.exists()) {
                setChatmsgs(doc.data().msgs);
            }
        });

        // Only auto-scroll if user is near the bottom
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            if (isNearBottom) {
                chatContainerRef.current.scrollTop = scrollHeight;
            }
        }
    }, [chatmsgs]);

    async function sendMessage(e) {
        e.preventDefault();
        const msg = inputValue;
        if (!msg) return;
        setChatmsgs([...chatmsgs, { text: msg, sender: currentUser.uid, photo: currentUser.photoURL }]);
        setDoc(doc(db, "userMsgs", "msgs"),
            { msgs: [...chatmsgs, { text: msg, sender: currentUser.uid, photo: currentUser.photoURL }] });
        setInputValue("");
    }

    // Timer ref for long press
    const holdTimer = useRef(null);

    // Delete message by index
    async function deleteMessage(idx) {
        const newMsgs = chatmsgs.filter((_, i) => i !== idx);
        setChatmsgs(newMsgs);
        await setDoc(doc(db, "userMsgs", "msgs"), { msgs: newMsgs });
    }

    return (
        <>
            <button
                className='bg-red-500 text-white px-4 py-2 my-2 rounded-md cursor-pointer hover:bg-red-600 transition duration-300 active:opacity-50'
                id='signout' onClick={() => {
                    signOut(auth).then(() => {
                        console.log("Sign Out Successful");
                        navigate('/')
                    }).catch((error) => {
                        console.log(error);
                    });
                }}>
                Sign Out
            </button>

            {/* <!-- Chat Container --> */}
            <div
                className="bg-white rounded-lg shadow-md p-4 w-[95vw] sm:w-200">
                {/* <!-- Chat Header --> */}
                <div className="flex items-center mb-4">
                    <div className="ml-3">
                        <p className="text-xl font-medium">Welcome {currentUser['displayName']}</p>
                        <p className="text-gray-500">Online</p>
                    </div>
                </div >

                {/* <!-- Chat Messages --> */}
                <div
                    className="space-y-4 h-[70vh] sm:h-96 overflow-auto"
                    ref={chatContainerRef}
                >
                    <AnimatePresence>
                        {chatmsgs && chatmsgs.map((msg, idx) =>
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className='my-10'
                            >
                                <div className={`flex items-end gap-5 ${msg.sender === currentUser.uid ? "flex-row-reverse" : "flex-row"}`}>
                                    <img src={msg.photo} alt="Profile Picture" className='w-8 h-8 rounded-full' />
                                    <div
                                        className={`message ${msg.sender === currentUser.uid ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"} p-2 rounded-lg`}
                                        {...(msg.sender === currentUser.uid
                                            ? {
                                                onMouseDown: () => {
                                                    holdTimer.current = setTimeout(() => deleteMessage(idx), 800);
                                                },
                                                onMouseUp: () => {
                                                    clearTimeout(holdTimer.current);
                                                },
                                                onMouseLeave: () => {
                                                    clearTimeout(holdTimer.current);
                                                }
                                            }
                                            : {})}
                                        style={msg.sender === currentUser.uid ? { cursor: "pointer" } : {}}
                                        title={msg.sender === currentUser.uid ? "Hold to delete" : ""}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >

                {/* <!-- Chat Input --> */}
                <div className="mt-4 flex items-center justify-center" >
                    <input
                        type="text"
                        ref={msgRef}
                        value={inputValue}
                        placeholder="Type your message..."
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage(e)}
                        className={`flex-1 py-2 px-3 rounded-full bg-gray-50 focus:outline-none text-sm max-w-50 focus:max-w-96 transition-all duration-500${inputValue ? " max-w-96" : ""}`}
                    />
                    <button className="px-4 py-2 rounded-full ml-3 hover:bg-gray-200 cursor-pointer transition duration-500 ease-in" onClick={sendMessage}>Send</button>
                </div >
            </div >
        </>
    )
}
export default ChatBox
