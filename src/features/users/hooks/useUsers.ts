import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, fetchUsers, updateUser, deleteUser } from "../../../api/users";
import { UserFormData } from "../types";

// クエリー定数
const USERS_KEY = ['users'] as const;
const userKey = (id: number) => ['users', id] as const

// ユーザー一覧取得
export const useUsers = () => {
    return useQuery({
        queryKey: USERS_KEY,
        queryFn: fetchUsers
    });
};

// ユーザー詳細を取得
// export const useUser = (id: number) => {
//     return useQuery({
//         queryKey: userKey(id),
//         queryFn: () => fetchUser(id)
//     });
// };

// ユーザー作成
export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userData: UserFormData) => createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY })
        },
    });
}

// ユーザー更新
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY })
        }
    })
}

// ユーザー削除
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY })
        }
    })
}