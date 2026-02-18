import { User, UserFormData } from "../features/users/types";
import apiClient from "./client"

// ユーザー一覧取得
export const fetchUsers = async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
}

// ユーザー詳細取得
export const fetchUser = async (id: number): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(`/users/${id}`);
    return data;
}

// ユーザー作成
export const createUser = async (userDate: UserFormData): Promise<User[]> => {
    const { data } = await apiClient.post<User[]>(`/users`, {
        ...userDate,
        createdAt: new Date().toISOString(),
    });
    return data;
}

// ユーザー更新
export const updateUser = async (id: number, userDate: UserFormData): Promise<User[]> => {
    const { data } = await apiClient.put<User[]>(`/users/${id}`, {
        ...userDate,
    });
    return data;
}

// ユーザー削除
export const deleteUser = async (id: number): Promise<User[]> => {
    const { data } = await apiClient.delete<User[]>(`/users/${id}`);
    return data;
}