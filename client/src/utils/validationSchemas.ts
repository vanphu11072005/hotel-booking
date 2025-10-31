import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
  full_name: yup
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .required('Họ tên là bắt buộc'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ')
    .optional(),
  address: yup.string().optional(),
});
