import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../../../api/users";
import { UserFormData } from "../types";

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: UserFormData) => createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
