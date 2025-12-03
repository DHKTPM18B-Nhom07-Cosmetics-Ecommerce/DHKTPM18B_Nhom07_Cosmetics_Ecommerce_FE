import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Login.module.css'; // Sử dụng lại style của Login/Signup
import { Mail } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/auth';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' });
        setIsLoading(true);

        try {
            // Gọi endpoint yêu cầu gửi token
            const response = await axios.post(`${API_BASE_URL}/forgot-password-request`, {
                email: email,
            });

            // Backend luôn trả về 200 OK với thông báo chung (SuccessResponse)
            setStatus({
                message: response.data.message || 'No Messege from server',
                type: 'success'
            });

        } catch (err) {
            // Xử lý lỗi (Thường là 400 hoặc 500)
            let errorMessage = 'Lỗi kết nối hoặc hệ thống. Vui lòng thử lại sau.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setStatus({ message: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h2 className={styles.title}>QUÊN MẬT KHẨU</h2>
                <p className={styles.subtitle}>Nhập email của bạn để nhận mã đặt lại.</p>

                <div className={styles.loginContainer}>

                    {status.message && (
                        <>
                            <span className={styles.errorMessage} style={{
                                color: status.type === 'error' ? 'red' : 'green',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}>
                                {status.message}
                            </span>
                            {status.type !== 'error' && (
                                <p><Link to="/reset-password" className={styles.registerLink}>Xác nhận</Link></p>                             
                            )}
                        </>
                    )}

                    <form onSubmit={handleSubmit} className={styles.loginForm}>

                        {/* Nhập Email */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className={styles.input}
                                    required
                                    disabled={isLoading}
                                />
                                <Mail className={styles.passwordToggle} style={{ pointerEvents: 'none' }} />
                            </div>
                        </div>

                        {/* Nút Gửi Yêu cầu */}
                        <button type="submit" className={styles.loginButton} disabled={isLoading}>
                            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>

                        <p className={styles.registerPrompt}>
                            <Link to="/login" className={styles.registerLink}>Quay lại Đăng nhập</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;