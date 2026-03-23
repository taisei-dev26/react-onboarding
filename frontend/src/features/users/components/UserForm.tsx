import { useForm, Controller } from "react-hook-form";
import { UserFormData } from "../types"
import { userSchema } from "../validation/userSchema";
import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";

const roles = [
    { value: 'admin', label: '管理者'},
    { value: 'editor', label: '編集者'},
    { value: 'viewer', label: '閲覧者'},
]

const departments = ['開発部', 'マーケティング部', '営業部', '人事部', '総務部']

type UserFormProps = {
    defaultValues?: UserFormData;
    onSubmit: (data: UserFormData) => void;
    isSubmitting: boolean;
}

const UserForm = ({ defaultValues, onSubmit, isSubmitting }: UserFormProps) => {
    const { control, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: yupResolver(userSchema), 
        defaultValues: defaultValues ?? {
            name: '',
            email: '',
            role: 'viewer',
            department: ''
        }
    })

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
                <Controller name="name" control={control} render={({ field }) => (
                    <TextField {...field} label="名前" error={!!errors.name} helperText={errors.name?.message} fullWidth />
                )}/>

                <Controller name="email" control={control} render={({ field }) => (
                    <TextField {...field} label="メールアドレス" error={!!errors.email} helperText={errors.email?.message} fullWidth />
                )}/>

                <Controller name="role" control={control} render={({ field }) => (
                    <TextField {...field} select label="権限" error={!!errors.role} helperText={errors.role?.message} fullWidth >
                        {roles.map((option) => (
                            <MenuItem key={option.value} value={option.value} >
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}/>

                <Controller name="department" control={control} render={({ field }) => (
                    <TextField {...field} select label="部署" error={!!errors.department} helperText={errors.department?.message} fullWidth >
                        {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                                {dept}
                            </MenuItem>
                        ))}
                    </TextField>
                )}/>

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    fullWidth
                    sx={{ mt: 2, py: 1.5 }}
                >
                    {isSubmitting ? '保存中...' : '保存'}
                </Button>
            </Stack>
        </Box>
    )
}

export default UserForm;
