import { useContext } from 'react';
import { AuthContext } from './AuthContextValue.js';

export const useAuth = () => useContext(AuthContext);
