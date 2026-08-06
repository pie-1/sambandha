/**
 * Auth Context instance
 * Kept separate from AuthProvider so fast-refresh can treat the
 * provider component and its consumers independently.
 */

import { createContext } from 'react';

export const AuthContext = createContext();
