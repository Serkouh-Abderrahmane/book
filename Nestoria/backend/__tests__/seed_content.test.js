const fs = require('fs');
const path = require('path');

describe('seed data content validation', () => {
  const seedPath = path.join(__dirname, '..', '..', 'database', '004_seed.sql');
  let sql = '';
  beforeAll(() => {
    sql = fs.readFileSync(seedPath, 'utf8');
  });

  test('no forbidden English demo names remain', () => {
    const forbidden = ['House of Cardamom', 'Silk Route Inn', 'Postcard from Munnar', 'Indigo Lodge'];
    for (const f of forbidden) {
      expect(sql).not.toEqual(expect.stringContaining(f));
    }
  });

  test('all hotel address values contain TP. Hồ Chí Minh', () => {
    // Find each VALUES(...) hotel insert line and assert address contains the required city
    const startIndex = sql.indexOf('INSERT INTO hotels');
    expect(startIndex).toBeGreaterThan(-1);
    // find the end of this INSERT statement (the closing ');' following the block)
    const endIndex = sql.indexOf('\n\n', startIndex); // rough end: blank line after block
    const block = sql.slice(startIndex, endIndex > startIndex ? endIndex : startIndex + 2000);
    // Look for occurrences of TP. Hồ Chí Minh (exact)
    const occurrences = (block.match(/TP\. Hồ Chí Minh/g) || []).length;
    expect(occurrences).toBeGreaterThanOrEqual(8); // we expect at least 8 hotel rows
    // Also ensure no address contains the abbreviated 'TP. HCM' or English-only HCM
    expect(sql).not.toMatch(/\bTP\. HCM\b/i);
  });

  test('hotel names are Vietnamese and not English-only', () => {
    // Extract the name fields from the hotels VALUES (...) — crude but effective for seed validation
    // Recompute the hotels INSERT block locally
    const startIndex = sql.indexOf('INSERT INTO hotels');
    expect(startIndex).toBeGreaterThan(-1);
    // find the end of the hotels INSERT block by locating the next SQL comment section
    let endIndex = sql.indexOf('\n\n-- -------------------------------------------------------------', startIndex);
    if (endIndex === -1) {
      endIndex = sql.indexOf('\n);', startIndex);
      if (endIndex === -1) endIndex = sql.indexOf(');', startIndex);
    }
    const block = sql.slice(startIndex, endIndex > startIndex ? endIndex : startIndex + 2000);
    // Parse tuples inside the VALUES(...) block and extract the 3rd quoted field (hotel name)
    const names = [];
    for (let i = 0; i < block.length; i++) {
      if (block[i] === '(') {
        // find matching closing ')'
        let depth = 0;
        let j = i;
        while (j < block.length) {
          if (block[j] === '(') depth++;
          else if (block[j] === ')') {
            depth--;
            if (depth === 0) break;
          }
          j++;
        }
        if (j >= block.length) break;
        const tuple = block.slice(i + 1, j);
        const quoted = [...tuple.matchAll(/'([^']*)'/g)].map(x => x[1]);
        if (quoted.length >= 2) {
          // quoted[0] = slug, quoted[1] = name
          names.push(quoted[1]);
        }
        i = j;
      }
    }
    expect(names.length).toBeGreaterThanOrEqual(8);
    // Ensure none of the names contain obvious English words from a small blacklist
    const englishWords = ['House', 'Inn', 'Lodge', 'Suite', 'Apartment', 'Studio'];
    for (const n of names) {
      for (const w of englishWords) {
        expect(n).not.toMatch(new RegExp(`\\b${w}\\b`, 'i'));
      }
      // Also ensure the name contains at least one Vietnamese token
      const hasVietnameseToken = /Phòng|Căn hộ|Quận|Phòng trọ|Villa|Gò Vấp|Bình Thạnh|Thủ Đức|Thảo Điền|Bình Chánh|Phú Nhuận|Quận 7/.test(n);
      if (!hasVietnameseToken) {
        throw new Error(`Hotel name appears non-Vietnamese or missing expected tokens: "${n}"`);
      }
    }
  });
});
