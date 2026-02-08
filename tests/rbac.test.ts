import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  checkRole,
  checkRoles,
  getRoleName,
  getPermissions,
  ROLE_DEFINITIONS,
  type UserRole,
} from '../lib/rbac-utils';

describe('RBAC Utilities', () => {
  describe('hasPermission', () => {
    it('admin should have all permissions', () => {
      expect(hasPermission('admin', 'view_articles')).toBe(true);
      expect(hasPermission('admin', 'create_articles')).toBe(true);
      expect(hasPermission('admin', 'manage_users')).toBe(true);
    });

    it('planner should have event-related permissions', () => {
      expect(hasPermission('planner', 'create_events')).toBe(true);
      expect(hasPermission('planner', 'edit_events')).toBe(true);
      expect(hasPermission('planner', 'view_articles')).toBe(true);
    });

    it('planner should not have admin permissions', () => {
      expect(hasPermission('planner', 'manage_users')).toBe(false);
      expect(hasPermission('planner', 'view_analytics')).toBe(false);
    });

    it('user should have basic permissions', () => {
      expect(hasPermission('user', 'view_articles')).toBe(true);
      expect(hasPermission('user', 'view_events')).toBe(true);
      expect(hasPermission('user', 'purchase_tickets')).toBe(true);
    });

    it('user should not have creation permissions', () => {
      expect(hasPermission('user', 'create_articles')).toBe(false);
      expect(hasPermission('user', 'create_events')).toBe(false);
    });

    it('undefined role should have no permissions', () => {
      expect(hasPermission(undefined, 'view_articles')).toBe(false);
    });

    it('invalid role should have no permissions', () => {
      expect(hasPermission('invalid' as UserRole, 'view_articles')).toBe(false);
    });
  });

  describe('checkRole', () => {
    it('should return true for matching role', () => {
      expect(checkRole('admin', 'admin')).toBe(true);
      expect(checkRole('planner', 'planner')).toBe(true);
      expect(checkRole('user', 'user')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(checkRole('admin', 'user')).toBe(false);
      expect(checkRole('user', 'admin')).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(checkRole(undefined, 'admin')).toBe(false);
    });
  });

  describe('checkRoles', () => {
    it('should return true if role matches any in the list', () => {
      expect(checkRoles('admin', ['admin', 'planner'])).toBe(true);
      expect(checkRoles('user', ['admin', 'user'])).toBe(true);
    });

    it('should return false if role does not match any in the list', () => {
      expect(checkRoles('user', ['admin', 'planner'])).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(checkRoles(undefined, ['admin', 'planner'])).toBe(false);
    });
  });

  describe('getRoleName', () => {
    it('should return role name for valid role', () => {
      expect(getRoleName('admin')).toBe('管理者');
      expect(getRoleName('planner')).toBe('イベントプランナー');
      expect(getRoleName('user')).toBe('ユーザー');
    });

    it('should return "不明" for undefined role', () => {
      expect(getRoleName(undefined)).toBe('不明');
    });

    it('should return "不明" for invalid role', () => {
      expect(getRoleName('invalid' as UserRole)).toBe('不明');
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getPermissions('admin');
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('manage_users');
      expect(permissions).toContain('view_analytics');
    });

    it('should return planner permissions', () => {
      const permissions = getPermissions('planner');
      expect(permissions).toContain('create_events');
      expect(permissions).toContain('edit_events');
      expect(permissions).not.toContain('manage_users');
    });

    it('should return user permissions', () => {
      const permissions = getPermissions('user');
      expect(permissions).toContain('view_articles');
      expect(permissions).toContain('purchase_tickets');
      expect(permissions).not.toContain('create_events');
    });

    it('should return empty array for undefined role', () => {
      expect(getPermissions(undefined)).toEqual([]);
    });
  });

  describe('ROLE_DEFINITIONS', () => {
    it('should have all required roles defined', () => {
      expect(ROLE_DEFINITIONS).toHaveProperty('admin');
      expect(ROLE_DEFINITIONS).toHaveProperty('planner');
      expect(ROLE_DEFINITIONS).toHaveProperty('user');
    });

    it('each role should have name and permissions', () => {
      Object.values(ROLE_DEFINITIONS).forEach((role) => {
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('permissions');
        expect(Array.isArray(role.permissions)).toBe(true);
      });
    });

    it('admin should have more permissions than planner', () => {
      expect(ROLE_DEFINITIONS.admin.permissions.length).toBeGreaterThan(
        ROLE_DEFINITIONS.planner.permissions.length
      );
    });

    it('planner should have more permissions than user', () => {
      expect(ROLE_DEFINITIONS.planner.permissions.length).toBeGreaterThanOrEqual(
        ROLE_DEFINITIONS.user.permissions.length
      );
    });
  });
});
