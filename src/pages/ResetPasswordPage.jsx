import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Login.module.css';
import { Key, Lock, Mail } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8080/api/auth';

const ResetPasswordPage = () => {
    const [token, setToken] = useState(''); // Token nhận được qua email
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' });
        setIsLoading(true);

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Mật khẩu phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 chữ số.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ message: 'Mật khẩu mới và xác nhận mật khẩu không khớp!', type: 'error' });
            setIsLoading(false);
            return;
        }
        
        try {
            // Gọi endpoint đặt lại mật khẩu
            const response = await axios.post(`${API_BASE_URL}/reset-password`, {
                token: token,
                newPassword: newPassword,
            });

            // Thành công (200 OK)
            setStatus({ 
                message: response.data.message || 'Đặt lại mật khẩu thành công! Chuyển hướng đến trang đăng nhập...', 
                type: 'success' 
            });

            setTimeout(() => {
                navigate('/login'); // Chuyển về trang đăng nhập
            }, 3000);

        } catch (err) {
            // Xử lý lỗi (Token không hợp lệ/hết hạn)
            let errorMessage = 'Lỗi kết nối hoặc hệ thống. Vui lòng thử lại sau.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message; // Lỗi từ AuthService
            }
            setStatus({ message: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h2 className={styles.title}>ĐẶT LẠI MẬT KHẨU</h2>
                <p className={styles.subtitle}>Vui lòng nhập mã xác nhận và mật khẩu mới.</p>

                <div className={styles.loginContainer}>
                    
                    {status.message && (
                        <p className={styles.errorMessage} style={{ 
                            color: status.type === 'error' ? 'red' : 'green', 
                            textAlign: 'center', 
                            marginBottom: '20px'
                        }}>
                            {status.message}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        
                        {/* Nhập Token/Mã xác nhận */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="token" className={styles.label}>Mã xác nhận (nhận qua email)</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type="text"
                                    id="token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Nhập mã token đã nhận qua email"
                                    className={styles.input}
                                    required
                                />
                                <Key className={styles.passwordToggle} style={{ pointerEvents: 'none' }} />
                            </div>
                        </div>
                        
                        {/* Nhập Mật khẩu mới */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword" className={styles.label}>Mật khẩu mới</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
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

                        {/* Xác nhận Mật khẩu mới */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu mới</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Xác nhận mật khẩu mới"
                                    className={styles.input}
                                    required
                                />
                                <Lock className={styles.passwordToggle} style={{ pointerEvents: 'none', right: '45px' }} />
                            </div>
                        </div>

                        {/* Nút Đặt lại Mật khẩu */}
                        <button type="submit" className={styles.loginButton} disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Đặt lại Mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;