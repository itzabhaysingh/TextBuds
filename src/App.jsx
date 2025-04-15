import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import ChatBox from './components/ChatBox';
import { useAuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuthContext();
  return currentUser ? children : <Navigate to="/" />;
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          index
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/chatbox"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBox />
              </motion.div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
