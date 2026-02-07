

export const EUserRole = {
    ADMIN: "ADMIN",
    MANAGE: "MANAGE",
    EMPLOYEE: "EMPLOYEE",
    HR: "HR",
} as const;

export type EUserRole = keyof typeof EUserRole;

export interface DynamicKeyObject {
  [key: string]: any;
}