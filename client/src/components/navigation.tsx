import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900" data-testid="text-brand-name">
                CrazyTrainAI
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3" data-testid="user-profile">
                {/* User avatar from Google */}
                <img
                  src={user.profileImageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-user-avatar"
                />
                <span className="text-sm font-medium text-gray-700" data-testid="text-user-name">
                  {user.firstName || user.email?.split('@')[0] || 'User'}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto"
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
