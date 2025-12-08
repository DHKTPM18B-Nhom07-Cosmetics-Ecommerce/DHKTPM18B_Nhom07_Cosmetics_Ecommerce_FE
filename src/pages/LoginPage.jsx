import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Login.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// 1. Import Custom Hook để truy cập Auth Context
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. Lấy hàm login từ Context
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Xóa lỗi cũ

        try {
            // 1. Gửi yêu cầu POST đến Backend API
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username: email,
                password: password,
            });

            // 2. Lấy data đầy đủ từ phản hồi của Backend
            const { token, fullName, role } = response.data;
            // để trang ProductCard có thể lấy được ID người dùng.
            localStorage.setItem('user', JSON.stringify(response.data));

            // 3. SỬ DỤNG HÀM LOGIN CỦA CONTEXT
            // Hàm này sẽ tự động: 
            // a) Lưu token & name vào localStorage
            // b) Cập nhật trạng thái User (setUser), kích hoạt Header re-render ngay lập tức
            login(token, fullName, role);

            // 4. Điều hướng người dùng dựa trên Vai trò (ROLE)
            let redirectTo = '/products';
            // Vai trò 'ADMIN' hoặc 'EMPLOYEE' sẽ được chuyển đến trang /admin
            if (role === 'ADMIN' || role === 'EMPLOYEE') {
                redirectTo = '/admin'; 
            }

            navigate(redirectTo);

        } catch (err) {
            // Xử lý lỗi từ Backend (ví dụ: Tên đăng nhập hoặc mật khẩu không đúng)
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Lỗi đăng nhập không xác định. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className={styles.loginPage}>

            <div className={styles.loginCard}>
                <h2 className={styles.title}>Đăng nhập tài khoản</h2>
                <p className={styles.subtitle}>Trải nghiệm làm đẹp cùng Embrosia</p>
                <div className={styles.loginContainer}>
                    {error && (
                        <>
                        <p className={styles.errorMessage} style={{ 
                            color:'red', 
                            textAlign: 'center', 
                            marginBottom: '20px'
                        }}>
                            {error}
                        </p>
                        
                    </>
                    )}

                    <form onSubmit={handleSubmit} className={styles.loginForm}>

                        {/* Nhập Email */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email hoặc tên đăng nhập"
                                className={styles.input}
                                required
                            />
                        </div>

                        {/* Nhập Mật khẩu */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className={styles.input}
                                    required
                                />
                                <span
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* Tùy chọn Ghi nhớ và Quên mật khẩu */}
                        <div className={styles.optionsGroup}>
                            <div className={styles.rememberMe}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className={styles.checkbox}
                                />
                                <label htmlFor="rememberMe" className={styles.rememberLabel}>Ghi nhớ đăng nhập</label>
                            </div>
                            <Link to="/forgot-password" className={styles.forgotPassword}>Quên mật khẩu?</Link>
                        </div>

                        {/* Nút Đăng nhập */}
                        <button type="submit" className={styles.loginButton}>
                            Đăng nhập
                        </button>

                        {/* Chưa có tài khoản? Đăng ký ngay */}
                        <p className={styles.registerPrompt}>
                            Chưa có tài khoản? <Link to="/signup" className={styles.registerLink}>Đăng ký ngay</Link>
                        </p>
                    </form>
                </div> {/* End loginContainer */}

            </div>
        </div>
    );
};

export default LoginPage;