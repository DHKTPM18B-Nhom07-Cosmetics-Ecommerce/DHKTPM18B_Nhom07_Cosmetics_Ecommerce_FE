import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Cần import axios
import styles from '../../styles/Signup.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const API_BASE_URL = 'http://localhost:8080/api/auth'; 

const SignupPage = () => {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(''); // Thêm state cho lỗi
    const [success, setSuccess] = useState(''); // Thêm state cho thành công
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu và Xác nhận mật khẩu không khớp!');
            return;
        }
        if (!agreed) {
            setError('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
            return;
        }
        
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                fullName: fullName,
                phone: phone,
                email: email,
                password: password,
            });
            
            // Đăng ký thành công (201 Created)
            setSuccess(`Đăng ký thành công cho tài khoản ${response.data.username}! Chuyển hướng sau 3 giây...`);
            setTimeout(() => {
                navigate('/login'); // Chuyển sang trang đăng nhập
            }, 3000);

        } catch (err) {
            // Xử lý lỗi từ Backend (400 Bad Request)
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Hiển thị lỗi từ Service (ví dụ: Email đã tồn tại)
            } else {
                setError('Đăng ký thất bại do lỗi không xác định.');
            }
            console.error('Signup error:', err);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirm') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className={styles.appBackground}>
            <div className={styles.signupPage}>
                <h2 className={styles.title}>Tạo tài khoản mới</h2>
                <p className={styles.subtitle}>Trải nghiệm làm đẹp cùng Embrosia</p>

                {/* Khung chứa Form với màu xanh nhạt */}
                <div className={styles.signupContainer}>

                    {error && <p className={styles.errorMessage} style={{color: 'red', textAlign: 'center'}}>{error}</p>}
                    {success && <p className={styles.successMessage} style={{color: 'green', textAlign: 'center'}}>{success}</p>}

                    <form onSubmit={handleSubmit}>

                        {/* Hàng 1: Họ và tên & Số điện thoại */}
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="fullName" className={styles.label}>Họ và tên</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="0901234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {/* Hàng 2: Email */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>

                        {/* Hàng 3: Mật khẩu & Xác nhận mật khẩu */}
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Mật khẩu</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                    <span
                                        className={styles.togglePassword}
                                        onClick={() => togglePasswordVisibility('password')}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="********"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                    <span
                                        className={styles.togglePassword}
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Điều khoản sử dụng */}
                        <div className={styles.termsContainer}>
                            <input
                                type="checkbox"
                                id="agreed"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                required
                                className={styles.checkbox}
                            />
                            <label htmlFor="agreed" className={styles.termsLabel}>
                                Tôi đồng ý với <a href="#" className={styles.termsLink}>Điều khoản sử dụng</a> và <a href="#" className={styles.termsLink}>Chính sách bảo mật</a> của Embrosia
                            </label>
                        </div>

                        {/* Nút Đăng ký */}
                        <button type="submit" className={styles.signupButton}>
                            Đăng ký
                        </button>

                        {/* Đã có tài khoản? Đăng nhập ngay */}
                        <p className={styles.loginPrompt}>
                            Đã có tài khoản? <Link to="/login" className={styles.loginLink}>Đăng nhập ngay</Link>
                        </p>
                    </form>
                </div> {/* End signupContainer */}

                {/* Đăng ký bằng mạng xã hội */}
                <p className={styles.socialSignupText}>Hoặc đăng ký bằng</p>
                <div className={styles.socialIcons}>
                    {/* Sử dụng Icon Placeholder. Cần thay thế bằng các Icon thực tế (FcGoogle, FaFacebookF, FaApple) */}
                    <a href="#" className={styles.socialIcon} aria-label="Đăng ký bằng Google">G</a>
                    <a href="#" className={styles.socialIcon} aria-label="Đăng ký bằng Facebook">f</a>
                </div>

            </div>
        </div>
    );
};

export default SignupPage;