import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loginSuccess, logoutAction as logout } from '../redux/actions/authActions';
import store from '../redux/store';

// Initialize auth listener to keep Redux state in sync with Firebase Auth
export const initAuthListener = (store) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      store.dispatch(loginSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
    } else {
      // User is signed out
      store.dispatch(logout());
    }
  });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Get current user ID
export const getCurrentUserId = () => {
  return auth.currentUser ? auth.currentUser.uid : null;
};

// Format Firebase auth error messages
export const formatAuthError = (error) => {
  const errorCode = error.code;
  let errorMessage = 'An unknown error occurred';

  switch (errorCode) {
    case 'auth/email-already-in-use':
      errorMessage = 'This email is already in use';
      break;
    case 'auth/invalid-email':
      errorMessage = 'Invalid email address';
      break;
    case 'auth/user-disabled':
      errorMessage = 'This account has been disabled';
      break;
    case 'auth/user-not-found':
      errorMessage = 'No account found with this email';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Incorrect password';
      break;
    case 'auth/weak-password':
      errorMessage = 'Password is too weak';
      break;
    case 'auth/network-request-failed':
      errorMessage = 'Network error. Please check your connection';
      break;
    case 'auth/too-many-requests':
      errorMessage = 'Too many unsuccessful login attempts. Please try again later';
      break;
    case 'auth/session-expired':
      errorMessage = 'Your session has expired. Please sign in again';
      break;
    default:
      errorMessage = error.message || 'An unknown error occurred';
  }

  return errorMessage;
};

// Session timeout configuration - 5 minutes (300000 milliseconds)
const SESSION_TIMEOUT = 5 * 60 * 1000;
let inactivityTimer;
let lastActivity = Date.now();

// Track user activity
const resetInactivityTimer = () => {
  lastActivity = Date.now();
  clearTimeout(inactivityTimer);
  
  if (auth.currentUser) {
    inactivityTimer = setTimeout(async () => {
      // Check if the user has been inactive for the timeout period
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime >= SESSION_TIMEOUT && auth.currentUser) {
        try {
          // Force sign out due to inactivity
          await signOut(auth);
          store.dispatch(logout());
          // Set a flag to show the session expired message on next login attempt
          sessionStorage.setItem('sessionExpired', 'true');
        } catch (error) {
          console.error('Error signing out after inactivity:', error);
        }
      }
    }, SESSION_TIMEOUT);
  }
};

// Initialize session timeout tracking
export const initSessionTimeout = () => {
  // Reset the timer on various user interactions
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  // Add event listeners to track user activity
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, false);
  });
  
  // Initial setup
  resetInactivityTimer();
  
  // Check for session expired flag
  const sessionExpired = sessionStorage.getItem('sessionExpired');
  if (sessionExpired === 'true') {
    sessionStorage.removeItem('sessionExpired');
    // Return true if session was expired
    return true;
  }
  
  return false;
};

// Check if session has expired
export const hasSessionExpired = () => {
  return sessionStorage.getItem('sessionExpired') === 'true';
};