import { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ProtectedRoutesProps = {
    children: JSX.Element
}

const ProtectedRoute: React.FC<ProtectedRoutesProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" />
}

export default ProtectedRoute