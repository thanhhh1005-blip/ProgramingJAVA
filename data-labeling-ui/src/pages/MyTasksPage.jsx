import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const MyTasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('token');

  const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.scope || payload.role || payload.roles || "";
      if (roles.includes('REVIEWER')) return 'REVIEWER';
      if (roles.includes('ANNOTATOR')) return 'ANNOTATOR';
      return null;
    } catch (e) { return null; }
  };

  const role = getUserRole();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setIsLoading(true);
    try {
      let endpoint = role === 'REVIEWER' 
        ? `${API_BASE_URL}/projects/reviewer/my-projects` 
        : `${API_BASE_URL}/projects/my-projects`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.result) setProjects(data.result);
    } catch (error) {
      console.error("Lỗi lấy danh sách dự án:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: { padding: '40px', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' },
    header: { marginBottom: '40px' },
    title: { fontSize: '28px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 },
    badge: { marginLeft: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: role === 'REVIEWER' ? '#fef3c7' : '#dbeafe', color: role === 'REVIEWER' ? '#92400e' : '#1e40af' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    card: { backgroundColor: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', transition: '0.3s' },
    iconBox: { width: '50px', height: '50px', borderRadius: '16px', backgroundColor: role === 'REVIEWER' ? '#fffbeb' : '#eff6ff', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    projectTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' },
    description: { color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px', flex: 1 },
    button: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', backgroundColor: role === 'REVIEWER' ? '#f59e0b' : '#2563eb', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.2)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={{ backgroundColor: '#2563eb', padding: '8px', borderRadius: '12px', color: 'white' }}>🎯</span> 
          Nhiệm vụ của tôi 
          <span style={styles.badge}>{role || 'USER'}</span>
        </h2>
        <p style={{ color: '#64748b', marginTop: '10px', fontWeight: '500' }}>Xin chào! Bạn có {projects.length} dự án cần xử lý.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 'bold' }}>Đang tải dữ liệu...</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '30px', border: '2px dashed #e2e8f0' }}>
          <p style={{ fontSize: '50px' }}>🏝️</p>
          <h3 style={{ color: '#1e293b' }}>Chưa có dự án nào được phân công</h3>
          <button onClick={fetchMyProjects} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Làm mới trang 🔄</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <div key={project.id} style={styles.card} className="task-card">
              <div style={styles.iconBox}>
                {role === 'REVIEWER' ? '🔍' : '📝'}
              </div>
              <h3 style={styles.projectTitle}>{project.name}</h3>
              <p style={styles.description}>
                {project.description || "Dự án này chưa có mô tả chi tiết từ hệ thống. Vui lòng nhấn nút bên dưới để bắt đầu."}
              </p>
              <button 
                style={styles.button}
                onClick={() => navigate(role === 'REVIEWER' ? `/admin/review/${project.id}` : `/workspace/${project.id}`)}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                {role === 'REVIEWER' ? 'XEM & DUYỆT NHÃN' : 'BẮT ĐẦU GÁN NHÃN'} ➔
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* CSS cho hiệu ứng xoay loading */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .task-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default MyTasksPage;