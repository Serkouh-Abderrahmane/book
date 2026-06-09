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
  checkin_date: z.string().min(1, 'Chọn ngày nhận phòng'),
  checkout_date: z.string().min(1, 'Chọn ngày trả phòng'),
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
  name: z.string().min(2, 'Tên khách sạn không được để trống'),
  slug: z.string().min(2, 'Slug URL không được để trống').regex(/^[a-z0-9-]+$/, 'Chỉ chấp nhận chữ thường, số và dấu gạch ngang'),
  region: z.string().min(1, 'Vui lòng chọn khu vực'),
  city: z.string().min(1, 'Vui lòng nhập thành phố'),
  description: z.string().min(20, 'Mô tả cần tối thiểu 20 ký tự'),
  hue: z.enum(['sand', 'ocean', 'forest', 'dusk', 'warm', 'cool']).default('sand'),
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
  type: z.string().min(2, 'Loại phòng không được để trống'),
  view: z.string().optional().or(z.literal('')),
  beds: z.string().optional().or(z.literal('')),
  size_sqm: z.coerce.number().int().min(1).optional(),
  price_per_night: z.coerce.number().int().min(1, 'Vui lòng nhập giá'),
  hue: z.enum(['sand', 'ocean', 'forest', 'dusk', 'warm', 'cool']).default('sand'),
  special_amenities: z.string().min(2, 'Liệt kê ít nhất một tiện nghi đặc biệt (phân cách bằng dấu phẩy)'),
});
