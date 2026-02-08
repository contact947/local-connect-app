import { UserProfile } from '@/hooks/use-firebase-auth-modular';

export type Role = "admin" | "planner" | "user";

export interface Permission {
  canViewNews: boolean;
  canViewEvents: boolean;
  canViewGifts: boolean;
  canCreateNews: boolean;
  canCreateEvents: boolean;
  canCreateGifts: boolean;
  canEditNews: boolean;
  canEditEvents: boolean;
  canEditGifts: boolean;
  canDeleteNews: boolean;
  canDeleteEvents: boolean;
  canDeleteGifts: boolean;
  canManageUsers: boolean;
}

/**
 * ロールに基づいて権限を取得する
 */
export function getPermissions(role: Role): Permission {
  const basePermissions: Permission = {
    canViewNews: true,
    canViewEvents: true,
    canViewGifts: true,
    canCreateNews: false,
    canCreateEvents: false,
    canCreateGifts: false,
    canEditNews: false,
    canEditEvents: false,
    canEditGifts: false,
    canDeleteNews: false,
    canDeleteEvents: false,
    canDeleteGifts: false,
    canManageUsers: false,
  };

  if (role === "admin") {
    return {
      ...basePermissions,
      canCreateNews: true,
      canCreateEvents: true,
      canCreateGifts: true,
      canEditNews: true,
      canEditEvents: true,
      canEditGifts: true,
      canDeleteNews: true,
      canDeleteEvents: true,
      canDeleteGifts: true,
      canManageUsers: true,
    };
  }

  if (role === "planner") {
    return {
      ...basePermissions,
      canCreateEvents: true,
      canEditEvents: true,
      canDeleteEvents: true,
    };
  }

  return basePermissions;
}

/**
 * ユーザーが特定の権限を持っているかチェック
 */
export function hasPermission(user: UserProfile | null, permission: keyof Permission): boolean {
  if (!user) return false;

  const permissions = getPermissions(user.role);
  return permissions[permission];
}

/**
 * ユーザーがadmin権限を持っているかチェック
 */
export function isAdmin(user: UserProfile | null): boolean {
  return user?.role === "admin";
}

/**
 * ユーザーがplanner権限を持っているかチェック
 */
export function isPlanner(user: UserProfile | null): boolean {
  return user?.role === "planner";
}

/**
 * ユーザーが通常ユーザーかチェック
 */
export function isRegularUser(user: UserProfile | null): boolean {
  return user?.role === "user";
}
