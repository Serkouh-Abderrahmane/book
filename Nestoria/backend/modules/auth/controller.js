const bcrypt = require('bcryptjs');
const { userRepo } = require('../../lib/userRepo');
const { signToken } = require('../../lib/jwt');
const { verifyGoogleIdToken } = require('../../config/google');
const { asyncHandler, badRequest, unauthorized, forbidden, notFound } = require('../../lib/http');

const VALID_ROLES = ['customer', 'host', 'admin'];
const SALT_ROUNDS = 10;

function assertRole(role) {
  if (!VALID_ROLES.includes(role)) throw badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`);
}

function publicShape(user, role) {
  const onboarded = role === 'host'
    ? Boolean(user.business_name && user.phone)
    : true;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    profile_image_url: user.profile_image_url,
    business_name: user.business_name ?? null,
    onboarded,
    role,
  };
}

function issueToken(user, role) {
  return signToken({ id: user.id, role, email: user.email });
}

// ---------- POST /auth/register ----------
const register = asyncHandler(async (req, res) => {
  const { role, email, password, full_name, phone } = req.body;
  assertRole(role);
  if (role === 'admin') throw forbidden('Admin accounts cannot be registered via public API');
  if (!email || !password || !full_name) throw badRequest('email, password and full_name are required');
  if (password.length < 6) throw badRequest('password must be at least 6 characters');

  const repo = userRepo(role);
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await repo.create({ email: email.toLowerCase(), password_hash, full_name, phone });
  const token = issueToken(user, role);
  res.status(201).json({ token, user: publicShape(user, role) });
});

// ---------- POST /auth/login ----------
const login = asyncHandler(async (req, res) => {
  const { role, email, password } = req.body;
  assertRole(role);
  if (!email || !password) throw badRequest('email and password are required');

  const repo = userRepo(role);
  const record = await repo.getByEmail(email.toLowerCase());
  if (!record) throw unauthorized(`Tài khoản "${email}" không tồn tại.`);
  if (!record.password_hash) {
    throw unauthorized('Tài khoản này sử dụng Google. Vui lòng nhấn "Tiếp tục với Google".');
  }
  const ok = await bcrypt.compare(password, record.password_hash);
  if (!ok) throw unauthorized('Mật khẩu không chính xác. Vui lòng thử lại.');

  const token = issueToken(record, role);
  res.json({ token, user: publicShape(record, role) });
});

// ---------- POST /auth/google ----------
const googleAuth = asyncHandler(async (req, res) => {
  const { role, credential } = req.body;
  assertRole(role);
  if (!credential) throw badRequest('credential (Google ID token) is required');

  const profile = await verifyGoogleIdToken(credential);
  if (!profile.emailVerified) throw unauthorized('Google account email is not verified');

  const repo = userRepo(role);
  let user = await repo.getByGoogleSub(profile.sub);
  if (!user) {
    // Fall back to email match — link Google to an existing account if it exists.
    user = await repo.getByEmail(profile.email.toLowerCase());
    if (user) {
      await repo.linkGoogle(user.id, profile.sub);
    } else {
      user = await repo.create({
        email: profile.email.toLowerCase(),
        google_sub: profile.sub,
        full_name: profile.name || `${profile.givenName || ''} ${profile.familyName || ''}`.trim() || profile.email.split('@')[0],
        profile_image_url: profile.picture,
      });
    }
  }
  const token = issueToken(user, role);
  res.json({ token, user: publicShape(user, role) });
});

// ---------- GET /auth/me ----------
const me = asyncHandler(async (req, res) => {
  const repo = userRepo(req.user.role);
  const user = await repo.getById(req.user.id);
  if (!user) throw notFound('User no longer exists');
  res.json({ user: publicShape(user, req.user.role) });
});

module.exports = { register, login, googleAuth, me };
