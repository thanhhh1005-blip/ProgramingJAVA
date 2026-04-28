import React, { useState, useEffect } from 'react';
import './ManageUsersPage.css';
import { API_BASE_URL, getErrorMessage, getToken, parseApiResponse, unwrapResult } from '../lib/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State quản lý form
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Load danh sách users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const payload = await parseApiResponse(response);
      const result = unwrapResult(payload);
      setUsers(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({ id: '', username: '', password: '', firstName: '', lastName: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setFormData({ 
        id: user.id, 
        username: user.username, 
        password: '', // Thường không hiển thị password cũ
        firstName: user.firstName || '', 
        lastName: user.lastName || '' 
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';

    // Loại bỏ id khỏi payload khi gửi đi
    const { id, ...payload } = formData;
    const url = isEditMode ? `${API_BASE_URL}/users/${id}` : `${API_BASE_URL}/users`;
    if (isEditMode) delete payload.password; // Tùy logic backend có cho update pass không

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const apiPayload = await parseApiResponse(response);
      const result = unwrapResult(apiPayload);

      if (response.ok && result) {
        setShowModal(false);
        fetchUsers(); // Tải lại danh sách
      } else {
        alert(getErrorMessage(apiPayload, 'Có lỗi xảy ra!'));
      }
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      alert('Không thể lưu người dùng.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      await parseApiResponse(response);
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Xóa người dùng thất bại.');
      }
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h2>Quản lý Người dùng (Admin)</h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Thêm người dùng</button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Họ và Tên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.lastName} {user.firstName}</td>
                <td className="actions-cell">
                  <button className="btn btn-edit" onClick={() => openEditModal(user)}>Sửa</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Xóa</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditMode ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  disabled={isEditMode} // Thường không cho sửa username
                  required 
                />
              </div>
              {!isEditMode && (
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              )}
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;