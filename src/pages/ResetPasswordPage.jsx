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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' });
        setIsLoading(true);
        setNewPasswordError('');
        setConfirmPasswordError('');

        let isValid = true;

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setNewPasswordError('Mật khẩu phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 chữ số.');
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            isValid = false;
        }

        if (!isValid) {
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

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(prev => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
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
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới (8+ ký tự, 1 Hoa, 1 Số)"
                                    className={styles.input}
                                    required
                                />
                                <span
                                    className={styles.passwordToggle}
                                    // KHẮC PHỤC 3B: Dùng toggleNewPasswordVisibility
                                    onClick={toggleNewPasswordVisibility}
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {newPasswordError && <p className={styles.errorText}>{newPasswordError}</p>}
                        </div>

                        {/* Xác nhận Mật khẩu mới */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu mới</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className={styles.input}
                                    required
                                />
                                {/* KHẮC PHỤC 3D: Nút Toggle riêng cho Xác nhận Mật khẩu */}
                                <span
                                    className={styles.passwordToggle}
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {confirmPasswordError && <p className={styles.errorText}>{confirmPasswordError}</p>}
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