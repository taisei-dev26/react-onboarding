import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../../api/users";
import { UserFormData } from "../types";

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
