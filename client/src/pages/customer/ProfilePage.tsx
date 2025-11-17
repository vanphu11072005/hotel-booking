import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Pencil, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import userService from '../../services/api/userService';
import authService from '../../services/api/authService';
import bookingService, { type Booking } from '../../services/api/bookingService';
import Loading from '../../components/common/Loading';
import * as yup from 'yup';

type ProfileForm = {
  fullName: string;
  email: string;
  phone?: string;
};

const schema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ và tên'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  phone: yup.string().optional(),
  // No password fields in profile page — password changes
  // should use a dedicated flow for security.
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, setUser, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        // Try refresh profile from /api/auth/profile
        const profileRes = await authService.getProfile();
        const fetchedUser = (profileRes as any).data?.user ?? null;
        if (fetchedUser) {
          // Only update store if the fetched user differs to avoid
          // triggering repeated re-fetches (which caused 429).
          const current = useAuthStore.getState().userInfo as any;
          const shouldUpdate = !current || current.id !== fetchedUser.id || current.email !== fetchedUser.email;
          if (shouldUpdate) {
            setUser({
              id: fetchedUser.id,
              name: fetchedUser.name || fetchedUser.full_name || fetchedUser.fullName,
              email: fetchedUser.email,
              phone: fetchedUser.phone || fetchedUser.phone_number,
              avatar: fetchedUser.avatar,
              role: fetchedUser.role || 'user',
            } as any);
          }

          reset({
            fullName: fetchedUser.name || fetchedUser.full_name || '',
            email: fetchedUser.email || '',
            phone: fetchedUser.phone || fetchedUser.phone_number || '',
          });
        }

        // Load user's bookings
        const bookingsRes = await bookingService.getMyBookings();
        const bookingsList = (bookingsRes as any).data?.bookings ?? [];
        setBookings(bookingsList);
      } catch (err) {
        console.error('Load profile error:', err);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    load();
    // Intentionally omit `userInfo` and `setUser` from deps to avoid
    // re-running this effect when the store updates (that caused 429)
  }, [isAuthenticated, navigate, reset]);

  const onSubmit = async (values: ProfileForm) => {
    if (!userInfo) return;

    try {
      setSaving(true);

      // Prepare update payload
      const payload: any = {
        full_name: values.fullName,
        phone_number: values.phone,
      };

      // Password change is not supported on this form

      const response = await userService.updateUser(userInfo.id, payload);

      if ((response as any).success || (response as any).status === 'success') {
        const updated = (response as any).data?.user;
        if (updated) {
          // Normalize and update store
          const normalized = {
            id: updated.id,
            name: updated.full_name || updated.name || '',
            email: updated.email,
            phone: updated.phone_number || updated.phone,
            avatar: updated.avatar,
            role: updated.role || 'user',
          } as any;
          setUser(normalized);
          reset({
            fullName: normalized.name,
            email: normalized.email,
            phone: normalized.phone,
          });
        }

        toast.success('Cập nhật thông tin thành công');
      } else {
        throw new Error((response as any).message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      const message = err.response?.data?.message || err.message || 'Lỗi khi cập nhật';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen text="Đang tải hồ sơ..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Hồ sơ của tôi</h1>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center px-3 py-2 text-sm text-indigo-600 rounded hover:bg-indigo-50"
          >
            Xem tất cả đặt phòng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Profile Form */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                <input
                  {...register('fullName')}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                <input
                  {...register('phone')}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // reset to store values
                    if (userInfo) {
                      reset({
                        fullName: (userInfo as any).name || '',
                        email: (userInfo as any).email || '',
                        phone: (userInfo as any).phone || '',
                      });
                    }
                  }}
                  className="px-3 py-2 bg-red border rounded text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>

          {/* Right: Avatar + Bookings */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden mb-3">
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Ảnh</div>
                )}
              </div>
              <div className="text-center">
                <div className="font-medium">{userInfo?.name}</div>
                <div className="text-sm text-gray-500">{userInfo?.email}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Đặt phòng gần đây</h4>
              {bookings.length === 0 ? (
                <p className="text-sm text-gray-500">Bạn chưa có đặt phòng nào.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {bookings.slice(0, 6).map((b) => (
                    <div key={b.id} className="border rounded p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{b.booking_number}</div>
                          <div className="text-sm text-gray-500">{new Date(b.createdAt ?? (b as any).created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm text-indigo-600">{b.status}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.total_price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* consolidated: header button navigates to bookings */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
