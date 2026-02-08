/**
 * RBAC (Role-Based Access Control) ユーティリティ
 * ユーザーロール: admin, planner, user
 */

export type UserRole = 'admin' | 'planner' | 'user';

/**
 * ロール定義
 */
export const ROLE_DEFINITIONS = {
  admin: {
    name: '管理者',
    permissions: [
      'view_articles',
      'create_articles',
      'edit_articles',
      'delete_articles',
      'view_events',
      'create_events',
      'edit_events',
      'delete_events',
      'manage_users',
      'view_analytics',
    ],
  },
  planner: {
    name: 'イベントプランナー',
    permissions: [
      'view_articles',
      'view_events',
      'create_events',
      'edit_events',
      'view_tickets',
    ],
  },
  user: {
    name: 'ユーザー',
    permissions: [
      'view_articles',
      'view_events',
      'purchase_tickets',
      'view_gifts',
      'use_gifts',
    ],
  },
};

/**
 * ユーザーが特定の権限を持っているかチェック
 * @param role ユーザーロール
 * @param permission チェックする権限
 * @returns 権限を持っている場合は true
 */
export function hasPermission(role: UserRole | undefined, permission: string): boolean {
  if (!role || !ROLE_DEFINITIONS[role]) {
    return false;
  }
  return ROLE_DEFINITIONS[role].permissions.includes(permission);
}

/**
 * ユーザーが特定のロールを持っているかチェック
 * @param role ユーザーロール
 * @param requiredRole チェックするロール
 * @returns ロールが一致する場合は true
 */
export function checkRole(role: UserRole | undefined, requiredRole: UserRole): boolean {
  return role === requiredRole;
}

/**
 * ユーザーが複数のロールのいずれかを持っているかチェック
 * @param role ユーザーロール
 * @param requiredRoles チェックするロール配列
 * @returns いずれかのロールが一致する場合は true
 */
export function checkRoles(role: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(role as UserRole);
}

/**
 * ロール名を取得
 * @param role ユーザーロール
 * @returns ロール名
 */
export function getRoleName(role: UserRole | undefined): string {
  if (!role || !ROLE_DEFINITIONS[role]) {
    return '不明';
  }
  return ROLE_DEFINITIONS[role].name;
}

/**
 * ロールの権限リストを取得
 * @param role ユーザーロール
 * @returns 権限リスト
 */
export function getPermissions(role: UserRole | undefined): string[] {
  if (!role || !ROLE_DEFINITIONS[role]) {
    return [];
  }
  return ROLE_DEFINITIONS[role].permissions;
}
