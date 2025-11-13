import * as yup from 'yup';

export const bookingValidationSchema = yup.object().shape({
  checkInDate: yup
    .date()
    .required('Vui lòng chọn ngày nhận phòng')
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      'Ngày nhận phòng không thể là ngày trong quá khứ'
    )
    .typeError('Ngày nhận phòng không hợp lệ'),

  checkOutDate: yup
    .date()
    .required('Vui lòng chọn ngày trả phòng')
    .min(
      yup.ref('checkInDate'),
      'Ngày trả phòng phải sau ngày nhận phòng'
    )
    .typeError('Ngày trả phòng không hợp lệ'),

  guestCount: yup
    .number()
    .required('Vui lòng nhập số người')
    .min(1, 'Số người tối thiểu là 1')
    .max(10, 'Số người tối đa là 10')
    .integer('Số người phải là số nguyên')
    .typeError('Số người phải là số'),

  notes: yup
    .string()
    .max(500, 'Ghi chú không được quá 500 ký tự')
    .optional(),

  paymentMethod: yup
    .mixed<'cash' | 'bank_transfer'>()
    .required('Vui lòng chọn phương thức thanh toán')
    .oneOf(
      ['cash', 'bank_transfer'],
      'Phương thức thanh toán không hợp lệ'
    ),

  fullName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),

  email: yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),

  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(
      /^[0-9]{10,11}$/,
      'Số điện thoại phải có 10-11 chữ số'
    ),
});

export type BookingFormData = yup.InferType<
  typeof bookingValidationSchema
>;
