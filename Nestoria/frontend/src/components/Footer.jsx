import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo-mark">Chi Vinh Land</span>
            <p>Nhà thuê và căn hộ chất lượng tại Thành phố Hồ Chí Minh — nơi mỗi ngôi nhà đều là tổ ấm.</p>
          </div>
          <div className="footer-col">
            <h4>Tìm nhà</h4>
            <Link to="/hotels">Khu vực</Link>
            <Link to="/hotels?sort=score">Nhà cho thuê nổi bật</Link>
            <Link to="/journal">Tin tức</Link>
          </div>
          <div className="footer-col">
            <h4>Công ty</h4>
            <Link to="/about">Về Chi Vinh Land</Link>
            <Link to="/become-host">Đăng tin cho thuê</Link>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="/help">Trung tâm trợ giúp</Link>
            <Link to="/contact">Liên hệ</Link>
            <Link to="/legal">Điều khoản</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Chi Vinh Land</span>
          <span className="text-mono">v 2.0</span>
        </div>
      </div>
    </footer>
  );
}
