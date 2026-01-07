import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../auth/AuthContext';
import { apiCall } from '../../api/api';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    if (!selectedRole) {
      alert('Vui lòng chọn vai trò trước khi đăng nhập!');
      return;
    }
    loginToServer();

  };
  function loginSuccess(data: any) {
    console.log("Login response:", data);

    const token = data.data.accessToken;
    const userRole = data.data.account.role;

    console.log("User role from backend:", userRole);
    console.log("Selected role from UI:", selectedRole);

    switch (selectedRole) {
      case 'Admin':
        if (userRole !== "ADMIN") {
          alert("Đăng nhập thất bại: Vai trò không khớp");
          return;
        }
        login(selectedRole, token);
        navigate('/admin');
        break;
      case 'Doctor':
        if (userRole !== "DOCTOR") {
          alert("Đăng nhập thất bại: Vai trò không khớp");
          return;
        }
        login(selectedRole, token);
        navigate('/doctor');
        break;
      case 'Receptionist':
        if (userRole !== "RECEPTIONIST") {
          alert("Đăng nhập thất bại: Vai trò không khớp");
          return;
        }
        login(selectedRole, token);
        navigate('/receptionist');
        break;
      case 'WarehouseStaff':
        if (userRole !== "WAREHOUSE_STAFF") {
          alert("Đăng nhập thất bại: Vai trò không khớp");
          return;
        }
        login(selectedRole, token);
        navigate('/warehouse-staff');
        break;
      case 'Patient':
        if (userRole !== "PATIENT") {
          alert("Đăng nhập thất bại: Vai trò không khớp");
          return;
        }
        login(selectedRole, token);
        navigate('/patient');
        break;
      default:
        navigate('/');
        break;
    }
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("username", data.data.account.username);
  }
  async function loginToServer() {
    const requestBody = {
      username: username,
      password: password
    }
    apiCall("auth/login", "POST", null, JSON.stringify(requestBody), loginSuccess, () => {
      alert("Đăng nhập thất bại")
    })
  }
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Đăng nhập hệ thống</h1>


        <div className="form-group">
          <label className="form-label" htmlFor="username">Tên tài khoản</label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Nhập tên tài khoản..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>


        <div className="form-group">
          <label className="form-label" htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


        <div className="form-group">
          <label className="form-label" htmlFor="role">Vai trò</label>
          <select
            id="role"
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
          >
            <option value="">-- Chọn vai trò --</option>
            <option value="Admin">Admin</option>
            <option value="Doctor">Bác sĩ</option>
            <option value="Receptionist">Lễ tân</option>
            <option value="WarehouseStaff">Thủ kho / Cấp phát thuốc</option>
            <option value="Patient">Bệnh nhân</option>
          </select>
        </div>


        <button onClick={handleLogin} className="login-button">
          Đăng nhập
        </button>
      </div>
      <div>
        <button onClick={(e)=>{
          navigate("/consultation");
        }}>Smart consultation from image</button>
      </div>
      <div>
        <button onClick={(e)=>{
          navigate("/register_patient");
        }}>Register for new patient</button>
        <button onClick={(e)=>{
          navigate("/create_account");
        }}>Create account</button>
        <button onClick={
          (e)=>{
            navigate("/forget_password");
          }
        }>Forget Password</button>
      </div>
    </div>
  );
};

export default LoginPage;
