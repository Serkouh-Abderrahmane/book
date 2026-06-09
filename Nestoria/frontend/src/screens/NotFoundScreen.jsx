import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFoundScreen() {
  const navigate = useNavigate();
  usePageTitle('');
  return (
    <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
      <h1 className="h-display"><em>404</em></h1>
      <p className="text-muted mt-4">Trang này chưa được viết.</p>
      <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>Về trang chủ</button>
    </div>
  );
}
