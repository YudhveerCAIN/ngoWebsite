// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEFAULT_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000; // 10 seconds

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith("http")) return endpoint;
  const cleanEndpoint = endpoint.startsWith("/api")
    ? endpoint.slice(4)
    : endpoint;
  return `${API_BASE_URL}${
    cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`
  }`;
};

// API error types
export const API_ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Custom API Error class
export class ApiError extends Error {
  constructor(message, type, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// Request timeout utility
function withTimeout(promise, timeout = DEFAULT_TIMEOUT) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new ApiError("Request timeout", API_ERROR_TYPES.TIMEOUT, 408)),
        timeout
      )
    ),
  ]);
}

// Response interceptor
async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  let data = null;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    // If response parsing fails, continue with null data
  }

  if (!response.ok) {
    let errorType = API_ERROR_TYPES.UNKNOWN;
    let message =
      data?.message || `HTTP ${response.status}: ${response.statusText}`;

    switch (response.status) {
      case 400:
        errorType = API_ERROR_TYPES.VALIDATION;
        break;
      case 401:
        errorType = API_ERROR_TYPES.AUTHENTICATION;
        break;
      case 403:
        errorType = API_ERROR_TYPES.AUTHORIZATION;
        break;
      case 404:
        errorType = API_ERROR_TYPES.NOT_FOUND;
        break;
      case 408:
        errorType = API_ERROR_TYPES.TIMEOUT;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = API_ERROR_TYPES.SERVER;
        break;
    }

    throw new ApiError(message, errorType, response.status, data);
  }

  return data;
}

// Base API request function
async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    cache = false,
    retries = 0,
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add authentication header if available
  const token = localStorage.getItem("adminToken");
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    method,
    headers: requestHeaders,
    ...fetchOptions,
  };

  // Add body for non-GET requests
  if (body && method !== "GET") {
    requestOptions.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  let lastError;

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(fetch(url, requestOptions), timeout);
      return await handleResponse(response);
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (error instanceof ApiError) {
        if (
          [
            API_ERROR_TYPES.AUTHENTICATION,
            API_ERROR_TYPES.AUTHORIZATION,
            API_ERROR_TYPES.VALIDATION,
            API_ERROR_TYPES.NOT_FOUND,
          ].includes(error.type)
        ) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  // If we get here, all retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  }

  // Handle network errors
  throw new ApiError("Network error occurred", API_ERROR_TYPES.NETWORK, 0, {
    originalError: lastError,
  });
}

// HTTP method helpers
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

// Specific API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    profile: "/auth/profile",
    validateToken: "/auth/validate-token",
    refreshToken: "/auth/refresh-token",
    changePassword: "/auth/change-password",
  },

  // About
  about: {
    story: "/about/story",
    visionMission: "/about/vision-mission",
    team: "/about/team",
  },

  // Volunteers
  volunteers: {
    list: "/volunteers",
    create: "/volunteers",
    byId: (id) => `/volunteers/${id}`,
    updateStatus: (id) => `/volunteers/${id}/status`,
    stats: "/volunteers/stats",
  },

  // Donations
  donations: {
    list: "/donations",
    create: "/donations",
    byId: (id) => `/donations/${id}`,
    payment: "/donations/payment",
    stats: "/donations/stats",
  },

  // Contact
  contact: {
    list: "/contact",
    create: "/contact",
    byId: (id) => `/contact/${id}`,
    updateStatus: (id) => `/contact/${id}/status`,
    stats: "/contact/stats",
  },

  // Impact
  impact: {
    overview: "/impact",
    period: (period) => `/impact/period/${period}`,
    trends: "/impact/trends",
  },
};

// API service functions
export const apiService = {
  // Authentication services
  auth: {
    login: (credentials) => api.post(endpoints.auth.login, credentials),
    logout: () => api.post(endpoints.auth.logout),
    getProfile: () => api.get(endpoints.auth.profile),
    validateToken: () => api.post(endpoints.auth.validateToken),
    refreshToken: () => api.post(endpoints.auth.refreshToken),
    changePassword: (data) => api.post(endpoints.auth.changePassword, data),
  },

  // About services
  about: {
    getStory: () => api.get(endpoints.about.story),
    getVisionMission: () => api.get(endpoints.about.visionMission),
    getTeam: () => api.get(endpoints.about.team),
  },

  // Volunteer services
  volunteers: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`${endpoints.volunteers.list}${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post(endpoints.volunteers.create, data),
    getById: (id) => api.get(endpoints.volunteers.byId(id)),
    updateStatus: (id, data) =>
      api.put(endpoints.volunteers.updateStatus(id), data),
    getStats: () => api.get(endpoints.volunteers.stats),
  },

  // Donation services
  donations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`${endpoints.donations.list}${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post(endpoints.donations.create, data),
    getById: (id) => api.get(endpoints.donations.byId(id)),
    processPayment: (data) => api.post(endpoints.donations.payment, data),
    getStats: () => api.get(endpoints.donations.stats),
  },

  // Contact services
  contact: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`${endpoints.contact.list}${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post(endpoints.contact.create, data),
    getById: (id) => api.get(endpoints.contact.byId(id)),
    updateStatus: (id, data) =>
      api.put(endpoints.contact.updateStatus(id), data),
    getStats: () => api.get(endpoints.contact.stats),
  },

  // Impact services
  impact: {
    getOverview: () => api.get(endpoints.impact.overview),
    getPeriod: (period) => api.get(endpoints.impact.period(period)),
    getTrends: (months = 12) =>
      api.get(`${endpoints.impact.trends}?months=${months}`),
  },
};

// Export default api object
export default api;
