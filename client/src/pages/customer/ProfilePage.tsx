import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Pencil, Loader2, Camera } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

      // First update textual profile fields
      const response = await authService.updateProfile(payload);

      if (!((response as any).success || (response as any).status === 'success')) {
        throw new Error((response as any).message || 'Cập nhật thất bại');
      }

      // If user selected a new avatar file, upload it as part of the same save
      let avatarUpdatedUser = null;
      if (selectedFile) {
        try {
          setUploading(true);
          const uploadRes = await authService.uploadAvatar(selectedFile);
          if (uploadRes?.success || uploadRes?.status === 'success') {
            avatarUpdatedUser = uploadRes.data?.user;
          } else {
            // Non-fatal: show warning but continue
            toast.warn(uploadRes?.message || 'Không thể cập nhật ảnh đại diện');
          }
        } catch (err: any) {
          console.error('Upload avatar error', err);
          const message = err.response?.data?.message || err.message || 'Lỗi khi tải lên ảnh';
          toast.warn(message);
        } finally {
          setUploading(false);
        }
      }

      // Prefer avatarUpdatedUser if available; otherwise take updated user from profile update
      const updated = avatarUpdatedUser ?? (response as any).data?.user;
      if (updated) {
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
        // clear selected file and preview URL (and revoke object URL)
        if (previewUrl) {
          try {
            URL.revokeObjectURL(previewUrl);
          } catch (e) {
            /* ignore */
          }
        }
        setSelectedFile(null);
        setPreviewUrl(null);
      }

      toast.success('Cập nhật thông tin thành công');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12">
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

        <div className="grid grid-cols-1 gap-6">
          {/* Single card: Avatar + Profile Form (merged) */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col items-center mb-4">
              <div
                role="button"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
                tabIndex={0}
                className="w-28 h-28 rounded-full overflow-hidden mb-3
                  ring-4 ring-white shadow-md flex items-center justify-center
                  relative cursor-pointer hover:opacity-90"
                aria-label="Đổi ảnh đại diện"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                ) : userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center
                    justify-center text-white font-semibold text-2xl">
                    {(userInfo?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0
                  hover:opacity-100 flex items-center justify-center text-white
                  transition-opacity rounded-full">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm font-medium">Đổi ảnh</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{userInfo?.name}</div>
                <div className="text-sm text-gray-500">{userInfo?.email}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                <input
                  {...register('fullName')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-transform transform hover:-translate-y-0.5"
                >
                  {(saving || uploading) ? <Loader2 className="animate-spin w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (userInfo) {
                      reset({
                        fullName: (userInfo as any).name || '',
                        email: (userInfo as any).email || '',
                        phone: (userInfo as any).phone || '',
                      });
                    }
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* Bookings: move below grid */}
        <div className="mt-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
            <h4 className="font-semibold mb-3 text-gray-800">Đặt phòng gần đây</h4>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-500">Bạn chưa có đặt phòng nào.</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 6).map((b) => (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/bookings/${b.id}`); }}
                    className="bg-white rounded-xl p-3 shadow hover:shadow-lg transition cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{b.booking_number}</div>
                        <div className="text-xs text-gray-400">{new Date(b.createdAt ?? (b as any).created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">{b.status}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Tổng: <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.total_price)}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
