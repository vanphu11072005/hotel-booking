import * as yup from 'yup';

/**
 * Login Validation Schema
 */
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .trim(),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  rememberMe: yup
    .boolean()
    .optional(),
});

/**
 * Register Validation Schema
 */
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được quá 50 ký tự')
    .trim(),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .trim(),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Mật khẩu phải chứa chữ hoa, chữ thường, ' +
      'số và ký tự đặc biệt'
    ),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
  phone: yup
    .string()
    .optional()
    .matches(
      /^[0-9]{10,11}$/,
      'Số điện thoại không hợp lệ'
    ),
});

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .trim(),
});

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Mật khẩu phải chứa chữ hoa, chữ thường, ' +
      'số và ký tự đặc biệt'
    ),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
});

// Types
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = 
  yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = 
  yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = 
  yup.InferType<typeof resetPasswordSchema>;
