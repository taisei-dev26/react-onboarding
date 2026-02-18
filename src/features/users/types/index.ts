export type Role = 'admin' | 'editor' | 'viewer';

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
    department: string
}

export type UserFormData = Omit<User, 'id' | 'createdAt'>;