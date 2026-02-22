import { Alert, Box, Chip, CircularProgress, Typography } from "@mui/material"
import { useUsers } from "../hooks/useUsers"
import UserTable from "../components/UserTable";


const UserListPage = () => {
    const { data: users, isLoading, isError, error } = useUsers();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (isError) {
        return (
            <Alert>
                ユーザーの取得に失敗しました: {(error as Error).message}
            </Alert>
        )
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mt: 2 }}>
                ユーザー一覧
            </Typography>
            <UserTable users={users ?? []}/>
        </Box>
    )
}

export default UserListPage;