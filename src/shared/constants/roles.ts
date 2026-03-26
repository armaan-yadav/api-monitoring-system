export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    CLIENT_VIEWER: 'client_viewer',
} as const;

export const CLIENT_ROLES = [ROLES.CLIENT_ADMIN, ROLES.CLIENT_VIEWER];

export const APPLICATION_ROLES = [ROLES.SUPER_ADMIN, ROLES.CLIENT_VIEWER];

export const isValidRole = (role: RoleType) => Object.values(ROLES).includes(role);

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
