require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');

(async ()=>{
  try {
    // Set region/city/address for all Chi Vinh properties
    await pool.query("UPDATE hotels SET region='Việt Nam', city='TP. Hồ Chí Minh', address='Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE name ILIKE '%Chi Vinh%'");
    // Ensure names are Vietnamese where possible
    await pool.query("UPDATE hotels SET name = regexp_replace(name, 'House of Cardamom|Casa Pamparo|Silk Route Inn|The Marigold House|Postcard from Munnar|The Salt House|Indigo Lodge|Aravali Retreat','Nhà Chi Vinh', 'gi') WHERE name ~* 'House of Cardamom|Casa Pamparo|Silk Route Inn|The Marigold House|Postcard from Munnar|The Salt House|Indigo Lodge|Aravali Retreat'");
    // For any non-Vietnam entries, if slug starts with chi-vinh-* leave, else mark as Chi Vinh House
    await pool.query("UPDATE hotels SET name = 'Chi Vinh House' WHERE name IS NULL OR trim(name) = ''");
    console.log('force_vietnamize: applied');
  } catch (e) { console.error('force_vietnamize failed', e.message || e); }
  finally { try{ await pool.end(); } catch(_){} }
})();
