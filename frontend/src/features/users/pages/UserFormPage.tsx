import { Alert, Box, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { useHistory, useParams } from "react-router-dom"
import { useCreateUser, useUpdateUser, useUser } from "../hooks/useUsers";
import { UserFormData } from "../types";
import UserForm from "../components/UserForm";

const UserFormPage = () => {
    const history = useHistory()
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const userId = Number(id);

    const { data: user, isLoading} = useUser(userId)
    const createMutation = useCreateUser()
    const updateMutation = useUpdateUser()

    // 送信処理
    const handleSubmit = (data: UserFormData) => {
        if (isEdit) {
            updateMutation.mutate(
                { id: userId, data },
                { onSuccess: () => history.push('/') }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => history.push('/')
            });
        }
    }

    // 編集モードかつデータ取得中はローディングスピナーを表示（フォームへの空データ流入を防ぐ）
    if (isEdit && isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    const defaultValues: UserFormData | undefined = 
        user ? { name: user.name, email: user.email, role: user.role, department: user.department } : undefined;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                    {isEdit ? 'ユーザー編集' : 'ユーザー登録'}
                </Typography>

                {(createMutation.isError || updateMutation.isError) && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        保存に失敗しました。もう一度お試しください。
                    </Alert>
                )}

                <UserForm
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isSubmitting={createMutation.isLoading || updateMutation.isLoading}
                />
            </Paper>
        </Container>
    )
}

export default UserFormPage;