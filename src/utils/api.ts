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

// Check if user exists and has completed onboarding
export const checkUserStatus = async (token?: string) => {
  const authToken = token || getToken();
  console.log("🔍 Checking user status with token:", authToken ? authToken.substring(0, 20) + "..." : "No token");

  if (!authToken) {
    console.log("❌ No auth token found");
    return { exists: false, hasCompletedOnboarding: false, userData: null };
  }

  try {
    console.log("📡 Making API call to /user/brand");
    const response = await fetch(`${API_BASE_URL}/user/brand`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 API Response status:", response.status);

    if (response.ok) {
      const userData = await response.json();
      console.log("✅ User data received:", userData);

      // Check multiple fields to determine if onboarding is completed
      // If user has any meaningful data, consider onboarding completed
      const hasCompletedOnboarding = userData && (
        userData.brand_name ||
        userData.name ||
        userData.brandName ||
        userData.domain ||
        userData.website ||
        userData.email ||
        userData.id ||
        // Check if userData is not empty and has some properties
        (typeof userData === 'object' && Object.keys(userData).length > 0)
      );

      console.log("🎯 Has completed onboarding:", !!hasCompletedOnboarding);

      return {
        exists: true,
        hasCompletedOnboarding: !!hasCompletedOnboarding,
        userData
      };
    } else {
      console.log("❌ API call failed with status:", response.status);
      const errorText = await response.text().catch(() => "Unknown error");
      console.log("❌ Error response:", errorText);

      // If it's a 404 or similar, user doesn't exist
      // If it's a 401, token might be invalid
      return { exists: false, hasCompletedOnboarding: false, userData: null };
    }
  } catch (error) {
    console.error("💥 Error checking user status:", error);
    return { exists: false, hasCompletedOnboarding: false, userData: null };
  }
};

// Alternative user status check that tries multiple endpoints and methods
export const checkUserStatusAlternative = async (token?: string) => {
  const authToken = token || getToken();
  console.log("🔍 Alternative user status check with token:", authToken ? authToken.substring(0, 20) + "..." : "No token");

  if (!authToken) {
    console.log("❌ No auth token found");
    return { exists: false, hasCompletedOnboarding: false, userData: null };
  }

  const endpoints = [
    { url: "/user/brand", method: "POST" },
    { url: "/user/brand", method: "GET" },
    { url: "/me", method: "GET" },
    { url: "/user", method: "GET" },
    { url: "/profile", method: "GET" }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Trying ${endpoint.method} ${endpoint.url}`);
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`📡 ${endpoint.method} ${endpoint.url} Response status:`, response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log(`✅ ${endpoint.method} ${endpoint.url} User data:`, userData);

        // Check if user has any meaningful data
        const hasCompletedOnboarding = userData && (
          userData.brand_name ||
          userData.name ||
          userData.brandName ||
          userData.domain ||
          userData.website ||
          userData.email ||
          userData.id ||
          (typeof userData === 'object' && Object.keys(userData).length > 0)
        );

        console.log(`🎯 ${endpoint.method} ${endpoint.url} Has completed onboarding:`, !!hasCompletedOnboarding);

        return {
          exists: true,
          hasCompletedOnboarding: !!hasCompletedOnboarding,
          userData,
          endpoint: `${endpoint.method} ${endpoint.url}`
        };
      } else {
        console.log(`❌ ${endpoint.method} ${endpoint.url} failed with status:`, response.status);
      }
    } catch (error) {
      console.error(`💥 ${endpoint.method} ${endpoint.url} Error:`, error);
    }
  }

  console.log("❌ All endpoints failed");
  return { exists: false, hasCompletedOnboarding: false, userData: null };
};

// Test function to debug API responses
export const testUserBrandAPI = async (token?: string) => {
  const authToken = token || getToken();
  console.log("🧪 Testing /user/brand API with token:", authToken ? authToken.substring(0, 20) + "..." : "No token");

  if (!authToken) {
    console.log("❌ No token available for testing");
    return;
  }

  // Test POST method first
  try {
    console.log("🧪 Testing POST /user/brand");
    const postResponse = await fetch(`${API_BASE_URL}/user/brand`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🧪 POST Response status:", postResponse.status);
    const postResponseText = await postResponse.text();
    console.log("🧪 POST Response body:", postResponseText);

  } catch (error) {
    console.error("🧪 POST Error:", error);
  }

  // Test GET method as well
  try {
    console.log("🧪 Testing GET /user/brand");
    const getResponse = await fetch(`${API_BASE_URL}/user/brand`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🧪 GET Response status:", getResponse.status);
    const getResponseText = await getResponse.text();
    console.log("🧪 GET Response body:", getResponseText);

  } catch (error) {
    console.error("🧪 GET Error:", error);
  }

  // Test /me endpoint as well
  try {
    console.log("🧪 Testing GET /me");
    const meResponse = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🧪 /me Response status:", meResponse.status);
    const meResponseText = await meResponse.text();
    console.log("🧪 /me Response body:", meResponseText);

  } catch (error) {
    console.error("🧪 /me Error:", error);
  }
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
