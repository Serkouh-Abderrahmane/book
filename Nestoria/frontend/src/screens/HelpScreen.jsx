import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { FAQ_GROUPS } from '../lib/content.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function HelpScreen() {
  usePageTitle('Trợ giúp');
  return (
    <div className="container-wide" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div className="mb-8">
        <div className="eyebrow mb-3">— Trung tâm trợ giúp</div>
        <h1 className="h-1" style={{ maxWidth: 720 }}>Chúng tôi có thể giúp gì?</h1>
        <p className="section-sub mt-3" style={{ maxWidth: 560, fontSize: 16 }}>
          Câu trả lời cho những thắc mắc thường gặp nhất. Không tìm thấy? <Link to="/contact" style={{ borderBottom: '1px solid var(--line-strong)' }}>Liên hệ</Link> — chúng tôi phản hồi trong vòng một ngày.
        </p>
      </div>

      <div className="help-shell">
        {/* Section nav */}
        <aside className="filters" style={{ alignSelf: 'start' }}>
          <div className="filter-block" style={{ paddingTop: 0 }}>
            <div className="filter-title">Chủ đề</div>
            <div className="stack" style={{ '--gap': '8px' }}>
              {FAQ_GROUPS.map((g) => (
                <a key={g.title} href={`#${g.title.toLowerCase()}`} className="text-muted" style={{ fontSize: 14, padding: '6px 0', display: 'block' }}>
                  {g.title}
                </a>
              ))}
            </div>
          </div>
          <div className="filter-block" style={{ borderBottom: 0 }}>
            <div className="filter-title">Cần hỗ trợ?</div>
            <Link to="/contact" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              <Icon name="mail" size={14} /> Liên hệ
            </Link>
          </div>
        </aside>

        {/* FAQ groups */}
        <div className="stack" style={{ '--gap': '48px' }}>
          {FAQ_GROUPS.map((g) => (
            <section key={g.title} id={g.title.toLowerCase()}>
              <div className="eyebrow mb-3">— {g.title}</div>
              <h2 className="h-2 mb-6">Câu hỏi về {g.title.toLowerCase()}</h2>
              <div className="stack" style={{ '--gap': '12px' }}>
                {g.items.map((item) => (
                  <details key={item.q} className="card" style={{ padding: '18px 22px' }}>
                    <summary style={{
                      cursor: 'pointer', fontSize: 16, fontWeight: 500,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                      listStyle: 'none',
                    }}>
                      <span>{item.q}</span>
                      <Icon name="plus" size={16} />
                    </summary>
                    <p className="text-muted mt-3" style={{ fontSize: 15, lineHeight: 1.65 }}>{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
