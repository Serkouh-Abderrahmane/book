import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Ít nhất 6 ký tự'),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Vui lòng nhập tên của bạn'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Ít nhất 6 ký tự'),
});

export const profileSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
});

export const hostProfileSchema = z.object({
  full_name: z.string().min(2, 'Vui lòng nhập tên'),
  phone: z.string().min(8, 'Số điện thoại lễ tân không hợp lệ'),
  business_name: z.string().min(2, 'Vui lòng nhập tên doanh nghiệp'),
  gst_number: z.string().optional().or(z.literal('')),
  payout_account: z.string().optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  room_id: z.number().int().positive(),
  checkin_date: z.string().min(1, 'Chọn ngày nhận nhà'),
  checkout_date: z.string().min(1, 'Chọn ngày trả nhà'),
  guests: z.number().int().min(1).max(10),
});

export const reviewSchema = z.object({
  booking_id: z.number().int().positive(),
  hotel_rating: z.number().min(1).max(5).optional(),
  hotel_comment: z.string().max(2000).optional(),
  room_rating: z.number().min(1).max(5).optional(),
  room_comment: z.string().max(2000).optional(),
});

export const hotelBasicsSchema = z.object({
  name: z.string().min(2, 'Tên nhà cho thuê không được để trống'),
  slug: z.string().min(2, 'Slug URL không được để trống').regex(/^[a-z0-9-]+$/, 'Chỉ chấp nhận chữ thường, số và dấu gạch ngang'),
  region: z.string().min(1, 'Vui lòng chọn khu vực'),
  city: z.string().min(1, 'Vui lòng nhập thành phố'),
  description: z.string().min(20, 'Mô tả cần tối thiểu 20 ký tự'),
  hue: z.enum(['sand', 'ocean', 'forest', 'dusk', 'warm', 'cool']).default('sand'),
  property_type: z.enum(['Phòng trọ','Căn hộ 3N2W','Căn hộ 2N2W','Căn hộ 2N1W','Căn hộ 1N','Căn hộ studio','Căn hộ chung cư mini'], { required_error: 'Vui lòng chọn loại nhà' }),
});
export const hotelAddressSchema = z.object({
  address: z.string().min(5, 'Địa chỉ không được để trống'),
  phone: z.string().optional().or(z.literal('')),
  checkin_time: z.string().default('15:00'),
  checkout_time: z.string().default('11:00'),
  amenities: z.array(z.string()).default([]),
  latitude: z.coerce.number().refine((v) => !Number.isNaN(v), 'Thả ghim trên bản đồ').optional(),
  longitude: z.coerce.number().refine((v) => !Number.isNaN(v), 'Thả ghim trên bản đồ').optional(),
});

export const roomSchema = z.object({
  name: z.string().min(2, 'Tên phòng không được để trống'),
  loai_phong_chinh: z.enum(['CAN_HO', 'PHONG_TRO'], { required_error: 'Vui lòng chọn loại phòng', message: 'Loại phòng không hợp lệ' }),
  loai_can_ho: z.string().optional().nullable(),
  property_type: z.enum(['Phòng trọ','Căn hộ 3N2W','Căn hộ 2N2W','Căn hộ 2N1W','Căn hộ 1N','Căn hộ studio','Căn hộ chung cư mini']).optional(),
  type: z.string().min(2, 'Loại phòng không được để trống'),
  view: z.string().optional().or(z.literal('')),
  beds: z.string().optional().or(z.literal('')),
  size_sqm: z.coerce.number().int().min(1).optional(),
  price_per_night: z.coerce.number().int().min(1, 'Vui lòng nhập giá'),
  hue: z.enum(['sand', 'ocean', 'forest', 'dusk', 'warm', 'cool']).default('sand'),
  special_amenities: z.string().optional().or(z.literal('')),
  electricity_price: z.coerce.number().int().min(0).optional().or(z.literal('')),
  water_price: z.coerce.number().int().min(0).optional().or(z.literal('')),
  management_fee: z.coerce.number().int().min(0).optional().or(z.literal('')),
  parking_fee: z.coerce.number().int().min(0).optional().or(z.literal('')),
  has_window: z.boolean().optional(),
  has_mattress: z.boolean().optional(),
  toilet_type: z.string().optional().or(z.literal('')),
  hour_rule: z.string().optional().or(z.literal('')),
  washing_machine: z.string().optional().or(z.literal('')),
  has_balcony: z.boolean().optional(),
  allow_pets: z.boolean().optional(),
  parking_type: z.string().optional().or(z.literal('')),
  ev_charger: z.boolean().optional(),
  structure_desc_title: z.string().optional().or(z.literal('')),
  structure_desc_vi_tri: z.string().optional().or(z.literal('')),
  structure_desc_tien_ich_xq: z.string().optional().or(z.literal('')),
  structure_desc_thuc_te: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.loai_phong_chinh === 'CAN_HO') {
    if (!data.loai_can_ho || !['CH_3N2W', 'CH_2N2W', 'CH_2N1W', 'STUDIO'].includes(data.loai_can_ho)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loai_can_ho'],
        message: 'Vui lòng chọn loại căn hộ',
      });
    }
  } else if (data.loai_phong_chinh === 'PHONG_TRO' && data.loai_can_ho) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['loai_can_ho'],
      message: 'Loại căn hộ chỉ áp dụng cho Căn hộ',
    });
  }
});

export const viewingSchema = z.object({
  hotel_id: z.number().int().positive(),
  room_id: z.number().int().positive().optional(),
  customer_name: z.string().min(2, 'Vui lòng nhập họ tên'),
  customer_phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  customer_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  preferred_date: z.string().min(1, 'Chọn ngày xem'),
  preferred_time: z.string().min(1, 'Chọn giờ xem'),
  note: z.string().optional().or(z.literal('')),
});
