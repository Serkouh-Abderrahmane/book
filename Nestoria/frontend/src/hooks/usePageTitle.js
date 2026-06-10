import { useEffect } from 'react';

const BASE = 'Chí Vĩnh Land';
const SITE = 'Cho thuê trọ & căn hộ Tp.HCM';
const DESC = 'Tìm phòng trọ, căn hộ, studio và chỗ ở chất lượng tại TP.HCM.';

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:')) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageTitle(title) {
  useEffect(() => {
    const full = title ? `${title} — ${BASE}` : `${BASE} - ${SITE}`;
    document.title = full;
    setMeta('og:title', full);
    setMeta('twitter:title', full);
    setMeta('description', title ? `${title} - ${DESC}` : DESC);
    setMeta('og:description', title ? `${title} - ${DESC}` : DESC);
    setMeta('twitter:description', title ? `${title} - ${DESC}` : DESC);
    return () => {
      document.title = `${BASE} - ${SITE}`;
      setMeta('og:title', `${BASE} - ${SITE}`);
      setMeta('twitter:title', `${BASE} - ${SITE}`);
      setMeta('description', DESC);
      setMeta('og:description', DESC);
      setMeta('twitter:description', DESC);
    };
  }, [title]);
}
