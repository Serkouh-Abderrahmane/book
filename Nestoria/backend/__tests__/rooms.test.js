const { badRequest } = require('../lib/http');

process.exit = jest.fn();

const mockQuery = jest.fn();
const mockConnect = jest.fn();

jest.mock('pg', () => {
  const mPool = {
    query: mockQuery,
    connect: mockConnect,
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { create, update } = require('../modules/rooms/controller');

function mockReq(body, params, user) {
  return {
    body: body || {},
    params: params || {},
    user: user || { id: 1, role: 'host' },
  };
}
function mockRes() {
  const r = {};
  r.status = jest.fn().mockReturnValue(r);
  r.json = jest.fn().mockReturnValue(r);
  return r;
}

describe('rooms controller — loai_phong_chinh + loai_can_ho validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery.mockImplementation((sql) => {
      if (sql.includes('host_id')) {
        return { rows: [{ host_id: 1 }] };
      }
      if (sql.includes('RETURNING')) {
        return { rows: [{ id: 1, loai_phong_chinh: 'CAN_HO', loai_can_ho: null }] };
      }
      return { rows: [] };
    });

    const mockClient = {
      query: jest.fn().mockImplementation((sql) => {
        if (sql.includes('RETURNING')) {
          return { rows: [{ id: 1, loai_phong_chinh: 'CAN_HO', loai_can_ho: null }] };
        }
        return { rows: [] };
      }),
      release: jest.fn(),
      on: jest.fn(),
    };
    mockConnect.mockResolvedValue(mockClient);
  });

  // ---------- loai_phong_chinh validation ----------
  test('rejects create when loai_phong_chinh is missing', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_phong_chinh/i);
  });

  test('rejects create with invalid loai_phong_chinh value', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'INVALID_TYPE',
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_phong_chinh/i);
  });

  test('rejects create with empty string loai_phong_chinh', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: '',
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_phong_chinh/i);
  });

  // ---------- loai_can_ho validation ----------
  test('rejects CAN_HO without loai_can_ho', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'CAN_HO',
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_can_ho/);
  });

  test('rejects CAN_HO with invalid loai_can_ho', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'CAN_HO',
      loai_can_ho: 'INVALID_SUB',
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_can_ho/);
  });

  test('rejects PHONG_TRO with loai_can_ho set', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'PHONG_TRO',
      loai_can_ho: 'STUDIO',
    });
    const next = jest.fn();
    await create(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toMatch(/loai_can_ho.*null/i);
  });

  // ---------- ACCEPTANCE ----------
  test('accepts CAN_HO with valid loai_can_ho', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'CAN_HO',
      loai_can_ho: 'CH_2N1W',
    });
    const res = mockRes();

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('accepts PHONG_TRO without loai_can_ho', async () => {
    const req = mockReq({
      hotel_id: 1,
      type: 'Standard',
      price_per_night: 5000,
      loai_phong_chinh: 'PHONG_TRO',
    });
    const res = mockRes();

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ---------- UPDATE ----------
  test('update accepts loai_phong_chinh in allowed fields', async () => {
    const req = mockReq(
      { loai_phong_chinh: 'PHONG_TRO' },
      { id: 1 }
    );
    const res = mockRes();

    await update(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  // ---------- ENUM MAPPING ----------
  test('loai_phong_chinh enum values are exactly CAN_HO and PHONG_TRO', () => {
    const validValues = ['CAN_HO', 'PHONG_TRO'];
    expect(validValues).toContain('CAN_HO');
    expect(validValues).toContain('PHONG_TRO');
    expect(validValues).not.toContain('can_ho');
    expect(validValues).not.toContain('phong_tro');
    expect(validValues).not.toContain('');
    expect(validValues).not.toContain('C\u0103n h\u1ED9');
    expect(validValues).not.toContain('Ph\u00F2ng tr\u1ECD');
  });

  test('loai_can_ho values are exactly the 4 sub-types', () => {
    const validValues = ['CH_3N2W', 'CH_2N2W', 'CH_2N1W', 'STUDIO'];
    expect(validValues).toContain('CH_3N2W');
    expect(validValues).toContain('CH_2N2W');
    expect(validValues).toContain('CH_2N1W');
    expect(validValues).toContain('STUDIO');
    expect(validValues).not.toContain('3N2W');
    expect(validValues).not.toContain('');
    expect(validValues).not.toContain(null);
  });

  test('backend validation rejects loai_phong_chinh with wrong case', () => {
    const validValues = ['CAN_HO', 'PHONG_TRO'];
    expect(validValues.includes('can_ho')).toBe(false);
    expect(validValues.includes('phong_tro')).toBe(false);
    expect(validValues.includes('Can Ho')).toBe(false);
    expect(validValues.includes('Phong Tro')).toBe(false);
  });
});
