import React, { useState } from 'react';
import styles from '../../styles/Login.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Cần cài đặt react-icons

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Đăng nhập với:', { email, password, rememberMe });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    // Dùng class 'appBackground' cho nền màu be nhạt
    <div className={styles.appBackground}> 
      <div className={styles.loginPage}>
        <h2 className={styles.title}>Đăng nhập tài khoản</h2>
        <p className={styles.subtitle}>Trải nghiệm làm đẹp cùng Embrosia</p>
        
        {/* Khung chứa Form với màu xanh nhạt */}
        <div className={styles.loginContainer}> 
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            
            {/* Trường Tên đăng nhập hoặc Email */}
            <div className={styles.inputGroup}>
              {/* Lưu ý: Label Tên đăng nhập hoặc Email nằm trong khung, không phải ngoài */}
              <label htmlFor="email" className={styles.label}>Tên đăng nhập hoặc Email</label>
              <input
                id="email"
                type="text"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            {/* Trường Mật khẩu */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <div className={styles.passwordInputContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <span 
                  className={styles.togglePassword} 
                  onClick={togglePasswordVisibility}
                >
                  {/* Icon mắt */}
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Ghi nhớ đăng nhập và Quên mật khẩu */}
            <div className={styles.optionsRow}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="rememberMe" className={styles.rememberLabel}>Ghi nhớ đăng nhập</label>
              </div>
              <a href="#" className={styles.forgotPassword}>Quên mật khẩu?</a>
            </div>
            
            {/* Nút Đăng nhập */}
            <button type="submit" className={styles.loginButton}>
              Đăng nhập
            </button>
            
            {/* Chưa có tài khoản? Đăng ký ngay */}
            <p className={styles.registerPrompt}>
              Chưa có tài khoản? <a href="#" className={styles.registerLink}>Đăng ký ngay</a>
            </p>
          </form>
        </div> {/* End loginContainer */}
        
        {/* Đăng nhập bằng mạng xã hội - Vị trí nằm ngoài khung */}
        <p className={styles.socialLoginText}>Hoặc đăng nhập bằng</p>
        <div className={styles.socialIcons}>
          {/* Cần icon Google */}
          <a href="#" className={styles.socialIcon} aria-label="Đăng nhập bằng Google">G</a> 
          {/* Cần icon Facebook */}
          <a href="#" className={styles.socialIcon} aria-label="Đăng nhập bằng Facebook">f</a> 
        </div>

      </div>
    </div>
  );
};

export default LoginPage;