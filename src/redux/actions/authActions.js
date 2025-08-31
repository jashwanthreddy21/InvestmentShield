// Auth action types
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// Action creators
export const loginRequest = () => ({
  type: LOGIN_REQUEST
});

export const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error
});

export const logoutAction = () => ({
  type: LOGOUT
});

// Async actions
export const login = (email, password) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    // Import the loginUser function from authService
    const { loginUser } = await import('../../services/authService');
    const user = await loginUser(email, password);
    
    // Format user data for Redux store
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    
    dispatch(loginSuccess(userData));
    return userData;
  } catch (error) {
    dispatch(loginFailure(error.message || 'Authentication failed'));
    throw error;
  }
};

export const logout = () => async (dispatch) => {
  try {
    // Import Firebase auth and signOut from firebase/auth
    const { auth } = await import('../../firebase/config');
    const { signOut } = await import('firebase/auth');
    
    // Sign out from Firebase
    await signOut(auth);
    
    // Dispatch logout action to update Redux state
    dispatch(logoutAction());
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const checkAuthState = () => async (dispatch) => {
  try {
    // Import Firebase auth and getCurrentUser from authService
    const { auth } = await import('../../firebase/config');
    const { onAuthStateChanged } = await import('firebase/auth');
    
    // Use Firebase's auth state observer
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch(loginSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
      } else {
        // User is signed out
        dispatch(logoutAction());
      }
    });
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
};