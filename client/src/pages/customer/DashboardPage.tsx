import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { ROLES } from '@/constants';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const getRoleBadge = (roleName: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    
    const labels = {
      admin: 'Quản trị viên',
      staff: 'Nhân viên',
      customer: 'Khách hàng',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm 
        font-medium ${styles[roleName as keyof typeof styles]}`}>
        {labels[roleName as keyof typeof labels]}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Dashboard
        </h1>

        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-start space-x-6">
            <div className="h-20 w-20 rounded-full bg-primary-100 
              flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between 
                mb-2">
                <h2 className="text-2xl font-bold">
                  {user?.full_name}
                </h2>
                {user && getRoleBadge(user.role.name)}
              </div>
              
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                
                {user?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.address}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>
                    Trạng thái: {' '}
                    <span className={user?.is_active 
                      ? 'text-green-600' : 'text-red-600'}>
                      {user?.is_active ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          {user?.role.name === ROLES.CUSTOMER && (
            <>
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Đặt phòng mới
                </h3>
                <p className="text-gray-600 text-sm">
                  Tìm và đặt phòng phù hợp với nhu cầu của bạn
                </p>
              </div>
              
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Lịch sử đặt phòng
                </h3>
                <p className="text-gray-600 text-sm">
                  Xem danh sách các lần đặt phòng trước đây
                </p>
              </div>
            </>
          )}
          
          {user?.role.name === ROLES.ADMIN && (
            <>
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Quản lý phòng
                </h3>
                <p className="text-gray-600 text-sm">
                  Thêm, sửa, xóa thông tin phòng
                </p>
              </div>
              
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Quản lý người dùng
                </h3>
                <p className="text-gray-600 text-sm">
                  Quản lý tài khoản và phân quyền
                </p>
              </div>
              
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Báo cáo thống kê
                </h3>
                <p className="text-gray-600 text-sm">
                  Xem báo cáo doanh thu và hoạt động
                </p>
              </div>
            </>
          )}
          
          {user?.role.name === ROLES.STAFF && (
            <>
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Check-in
                </h3>
                <p className="text-gray-600 text-sm">
                  Xử lý check-in cho khách hàng
                </p>
              </div>
              
              <div className="card hover:shadow-lg 
                transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">
                  Check-out
                </h3>
                <p className="text-gray-600 text-sm">
                  Xử lý check-out và thanh toán
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
