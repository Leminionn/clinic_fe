import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../auth/AuthContext';
import { apiCall } from '../../api/api';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [username, setUsername] = useState<String>("");
  const [password, setPassword] = useState<String>("");
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
    const token = data.data.accessToken;

    switch (selectedRole) {
      case 'Admin':
        if (data.data.account.role != "ADMIN") {
          alert("Đăng nhập thất bại");
          return;
        }
        login(selectedRole, token);
        navigate('/admin');
        break;
      case 'Doctor':
        if (data.data.account.role != "DOCTOR") {
          alert("Đăng nhập thất bại");
          return;
        }
        login(selectedRole, token);
        navigate('/doctor');
        break;
      case 'Receptionist':
        if (data.data.account.role != "RECEPTIONIST") {
          alert("Đăng nhập thất bại");
          return;
        }
        login(selectedRole, token);
        navigate('/receptionist');
        break;
      case 'WarehouseStaff':
        if (data.data.account.role != "WAREHOUSE_STAFF") {
          alert("Đăng nhập thất bại");
          return;
        }
        login(selectedRole, token);
        navigate('/warehouse-staff');
        break;
      case 'Patient':
        if (data.data.account.role != "PATIENT") {
          alert("Đăng nhập thất bại");
          return;
        }
        login(selectedRole, token);
        navigate('/patient');
        break;
      default:
        navigate('/');
        break;
    }
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", data.data.refreshToken);
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
    </div>
  );
};

export default LoginPage;
