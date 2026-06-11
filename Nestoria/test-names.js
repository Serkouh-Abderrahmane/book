// Quick test: verify API returns valid property names (no slugs, no removed-*)
// Usage: node test-names.js

const API = process.env.API_URL || 'http://localhost:5000/api';

async function main() {
  console.log(`Testing ${API}/hotels?sort=score ...\n`);

  const res = await fetch(`${API}/hotels?sort=score`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const { hotels } = await res.json();
  if (!hotels || hotels.length === 0) throw new Error('No hotels returned');

  console.log(`Found ${hotels.length} hotels\n`);

  let allGood = true;

  for (const h of hotels) {
    const name = h.name;
    const slug = h.slug;

    const issues = [];

    // Reject any name that looks like a slug or placeholder
    if (!name || name.trim() === '') {
      issues.push('name is empty');
    } else if (name.includes('[REMOVED]')) {
      issues.push('name contains [REMOVED]');
    } else if (name.startsWith('removed-')) {
      issues.push(`name starts with "removed-" (got "${name}")`);
    } else if (name === slug) {
      issues.push('name equals slug — slug is being shown as name');
    } else if (name.includes('-') && !name.includes(' ')) {
      // A slug-like name with hyphens and no spaces (e.g. "chi-vinh-pamparo")
      issues.push('name looks like a slug (hyphenated, no spaces)');
    }

    if (issues.length > 0) {
      console.log(`FAIL  id=${h.id}  ${issues.join('; ')}  name="${name}"  slug=${slug}`);
      allGood = false;
    } else {
      console.log(`OK    id=${h.id}  name="${name}"  slug=${slug}`);
    }
  }

  console.log('');
  if (allGood) {
    console.log('✓ All property names are valid');
    process.exit(0);
  } else {
    console.log('FAILED: Some property names are still broken');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('TEST FAILED:', err.message);
  process.exit(1);
});
