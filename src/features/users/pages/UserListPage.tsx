import { Alert, Box, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useUsers } from "../hooks/useUsers"
import { Role } from "../types"

const roleLabels: Record<Role, { label: string; color: 'error' | 'primary' | 'default' }> = {
    admin:  { label: '管理者', color: 'error' },
    editor: { label: '編集者', color: 'primary' },
    viewer: { label: '閲覧者', color: 'default' },
}

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

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>名前</TableCell>
                            <TableCell>メール</TableCell>
                            <TableCell>権限</TableCell>
                            <TableCell>部署</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={roleLabels[user.role].label} color={roleLabels[user.role].color} size="small"/>
                                </TableCell>
                                <TableCell>{user.department}</TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default UserListPage;