import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Custom Hook để sử dụng dễ dàng
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Auth Provider (Quản lý trạng thái và đồng bộ với localStorage)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu { name: '...', token: '...' }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tải trạng thái ban đầu từ localStorage khi khởi động
    const storedToken = localStorage.getItem('jwtToken');
    const storedName = localStorage.getItem('userName');
    
    if (storedToken && storedName) {
      setUser({ name: storedName, token: storedToken });
    }
    setIsLoading(false);
  }, []);

  // Hàm Đăng nhập (được gọi từ Login.jsx sau khi API thành công)
  const login = (token, fullName) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userName', fullName);
    setUser({ name: fullName, token: token });
  };

  // Hàm Đăng xuất
  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    setUser(null);
  };
  
  // Giá trị Context cung cấp
  const value = {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};