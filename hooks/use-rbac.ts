import { useFirebaseAuthContext } from '@/lib/firebase-auth-provider-modular';
import { hasPermission, checkRole, checkRoles, getRoleName, getPermissions, type UserRole } from '@/lib/rbac-utils';

/**
 * RBAC権限管理フック
 * ユーザーの権限をチェックするための便利なフック
 */
export function useRBAC() {
  const { profile } = useFirebaseAuthContext();
  const userRole = profile?.role as UserRole | undefined;

  return {
    userRole,
    roleName: getRoleName(userRole),
    permissions: getPermissions(userRole),
    
    // 権限チェック
    hasPermission: (permission: string) => hasPermission(userRole, permission),
    
    // ロールチェック
    isAdmin: () => checkRole(userRole, 'admin'),
    isPlanner: () => checkRole(userRole, 'planner'),
    isUser: () => checkRole(userRole, 'user'),
    
    // 複数ロールチェック
    isAdminOrPlanner: () => checkRoles(userRole, ['admin', 'planner']),
    isAdminOrUser: () => checkRoles(userRole, ['admin', 'user']),
    isPlannerOrUser: () => checkRoles(userRole, ['planner', 'user']),
  };
}
