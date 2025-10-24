import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          dispatch(logout());
          setIsInitializing(false);
          return;
        }

        // Verify token with backend
        try {
          const response = await fetch("https://aeotest-production.up.railway.app/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();
            dispatch(loginSuccess({ token, user: userData }));
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("accessToken");
            localStorage.removeItem("aeorank_user");
            localStorage.removeItem("aeorank_onboarding_completed");
            localStorage.removeItem("aeorank_onboarding_state");
            dispatch(logout());
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // Network error - keep user logged in but show loading
          dispatch(loginSuccess({ token }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading screen while initializing
  if (isInitializing || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="flex items-center space-x-2">
            <img 
              src="/AEO-Rank.jpeg" 
              alt="AEO Rank Logo" 
              className="w-8 h-8 rounded-sm object-cover" 
            />
            <span className="text-lg font-bold text-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const onboardingCompleted = localStorage.getItem("aeorank_onboarding_completed");
    const token = localStorage.getItem("accessToken");
    
    // If user has token but onboarding not completed, redirect to onboarding
    if (token && !onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    
    // Otherwise redirect to signup
    return <Navigate to="/signup" replace />;
  }

  // Check if onboarding is completed for dashboard routes
  const onboardingCompleted = localStorage.getItem("aeorank_onboarding_completed");
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  
  if (isDashboardRoute && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
