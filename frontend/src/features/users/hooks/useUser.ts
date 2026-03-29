import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../../api/users";

export const useUser = (id: number) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => fetchUser(id),
        enabled: !!id && id > 0,
    });
};
