const API_BASE_URL = "https://aeotest-production.up.railway.app";

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export const saveToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
};

// Fetch user profile data from /me endpoint (or /user/brand as fallback)
export const fetchUserProfile = async () => {
  try {
    // Try /me endpoint first
    const meResponse = await apiCall("/me");
    console.log("meResponse", meResponse);
    if (meResponse.ok) {
      return await meResponse.json();
    }
  } catch (error) {
    console.log(" ");
  }
  
  // Fallback to /user/brand endpoint (if supported)
  try {
    const brandResponse = await apiCall("");
    if (brandResponse.ok) {
      return await brandResponse.json();
    }
    // If method not allowed or other error, attempt /user/brand/get
    if (brandResponse.status === 405) {
      const getResponse = await apiCall("/user/brand/get");
      if (getResponse.ok) {
        return await getResponse.json();
      }
    }
  } catch (err) {
    // proceed to final error
  }
  
  throw new Error("Failed to fetch user profile");
};
