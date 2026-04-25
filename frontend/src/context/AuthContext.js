import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch (_) {}
    }
    setLoading(false);
  }, []);

  // Accepts both:
  //   login(res.data)         where res.data = { user, token, message }
  //   login(userData, jwt)    old two-arg style
  const login = (userDataOrResponse, jwt) => {
    let userData, tokenValue;
    if (jwt !== undefined) {
      userData   = userDataOrResponse;
      tokenValue = jwt;
    } else if (userDataOrResponse?.token) {
      userData   = userDataOrResponse.user;
      tokenValue = userDataOrResponse.token;
    } else {
      userData   = userDataOrResponse;
      tokenValue = null;
    }
    setToken(tokenValue);
    setUser(userData);
    if (tokenValue) localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
export default AuthContext;
