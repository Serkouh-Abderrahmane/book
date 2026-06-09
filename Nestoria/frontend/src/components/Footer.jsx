import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo-mark">Phong Cảnh Việt</span>
            <p>Tuyển tập chỗ nghỉ dưỡng cao cấp dành cho những du khách biết trân trọng từng chi tiết.</p>
          </div>
          <div className="footer-col">
            <h4>Khám phá</h4>
            <Link to="/hotels">Điểm đến</Link>
            <Link to="/hotels?sort=score">Chỗ nghỉ nổi bật</Link>
            <Link to="/journal">Tạp chí</Link>
          </div>
          <div className="footer-col">
            <h4>Công ty</h4>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/become-host">Trở thành đối tác</Link>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="/help">Trung tâm trợ giúp</Link>
            <Link to="/contact">Liên hệ</Link>
            <Link to="/legal">Điều khoản</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Phong Cảnh Việt</span>
          <span className="text-mono">v 2.0</span>
        </div>
      </div>
    </footer>
  );
}
