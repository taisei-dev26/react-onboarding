import { Alert, Box, CircularProgress, Typography } from "@mui/material"
import { useUsers, useDeleteUser } from "../hooks/useUsers"
import UserTable from "../components/UserTable";
import { useHistory } from "react-router-dom"
import { Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"


const UserListPage = () => {
    const { data: users, isLoading, isError, error } = useUsers();
    const history = useHistory();
    const deleteUserMutation = useDeleteUser();

    const handleEdit = (id: number) => {
        history.push(`/users/${id}/edit`);
    }

    const handleDelete = (id: number) => {
        if (window.confirm ('このユーザーを削除しますか？')) {
            deleteUserMutation.mutate(id);
        } 
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ mt: 2}}>
                ユーザーの取得に失敗しました: {(error as Error).message}
            </Alert>
        )
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ mt: 2 }}>
                    ユーザー一覧
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => history.push('/users/new')}>ユーザー登録</Button>
            </Box>
            <UserTable users={users ?? []} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
    )
}

export default UserListPage;