import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Key,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  Lock,
} from "lucide-react";

export const UserManagementAdvanced = () => {
  return (
    <div className="space-y-6">
      {/* Action buttons bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-lg border">
        <div className="space-y-1">
          <h3 className="font-semibold">Advanced User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage roles, permissions, and security settings
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Role Management
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Roles</div>
            <p className="text-xs text-muted-foreground">
              Admin, Manager, Commentator
            </p>
            <Button className="w-full mt-4" size="sm">
              Manage Roles
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
            <Button className="w-full mt-4" size="sm" variant="outline">
              View Sessions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Access rules configured
            </p>
            <Button className="w-full mt-4" size="sm" variant="outline">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password Policy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Configure password requirements
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for enhanced security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Session Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Manage user sessions and timeouts
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Audit Logs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    View system activity and changes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Logs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Mass Role Update</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="w-6 h-6" />
              <span className="text-sm">Export Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Upload className="w-6 h-6" />
              <span className="text-sm">Import Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm">Reset Passwords</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
