import { roomSchema } from '../lib/schemas';

describe('roomSchema loai_phong_chinh + loai_can_ho validation', () => {
  // ---------- loai_phong_chinh ----------
  test('rejects when loai_phong_chinh is missing', () => {
    const result = roomSchema.safeParse({ name: 'P.101', type: 'Standard', price_per_night: 5000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const loaiErr = result.error.issues.find((i) => i.path.includes('loai_phong_chinh'));
      expect(loaiErr).toBeTruthy();
    }
  });

  test('rejects invalid loai_phong_chinh value', () => {
    const result = roomSchema.safeParse({ name: 'P.101', loai_phong_chinh: 'INVALID', type: 'Standard', price_per_night: 5000 });
    expect(result.success).toBe(false);
  });

  test('rejects lowercase loai_phong_chinh', () => {
    const result = roomSchema.safeParse({ name: 'P.101', loai_phong_chinh: 'can_ho', type: 'Standard', price_per_night: 5000 });
    expect(result.success).toBe(false);
  });

  test('accepts CAN_HO with valid loai_can_ho', () => {
    const result = roomSchema.safeParse({
      name: 'P.101',
      loai_phong_chinh: 'CAN_HO',
      loai_can_ho: 'CH_2N1W',
      type: 'Standard',
      price_per_night: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.loai_phong_chinh).toBe('CAN_HO');
      expect(result.data.loai_can_ho).toBe('CH_2N1W');
    }
  });

  test('rejects CAN_HO without loai_can_ho', () => {
    const result = roomSchema.safeParse({
      name: 'P.101', loai_phong_chinh: 'CAN_HO', type: 'Standard', price_per_night: 5000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('loai_can_ho'))).toBe(true);
    }
  });

  test('rejects CAN_HO with invalid loai_can_ho', () => {
    const result = roomSchema.safeParse({
      name: 'P.101',
      loai_phong_chinh: 'CAN_HO',
      loai_can_ho: 'INVALID_SUB',
      type: 'Standard',
      price_per_night: 5000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('loai_can_ho'))).toBe(true);
    }
  });

  test('accepts PHONG_TRO without loai_can_ho', () => {
    const result = roomSchema.safeParse({
      name: 'P.101', loai_phong_chinh: 'PHONG_TRO', type: 'Standard', price_per_night: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.loai_phong_chinh).toBe('PHONG_TRO');
    }
  });

  test('rejects PHONG_TRO with loai_can_ho set', () => {
    const result = roomSchema.safeParse({
      name: 'P.101',
      loai_phong_chinh: 'PHONG_TRO',
      loai_can_ho: 'STUDIO',
      type: 'Standard',
      price_per_night: 5000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('loai_can_ho'))).toBe(true);
    }
  });
});
