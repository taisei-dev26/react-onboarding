import * as yup from 'yup';
import { Role } from '../types';

export const userSchema = yup.object({
    name: yup
        .string()
        .required('名前は必須です')
        .max(50, '名前は50文字以内で入力してください'),
    email: yup
        .string()
        .required('メールアドレスは必須です')
        .email('メールアドレスの形式が正しくありません'),
    role: yup
        .mixed<Role>()
        .required('権限は必須です')
        .oneOf(['admin', 'editor', 'viewer'] as Role[], '無効な権限です'),
    department: yup
        .string()
        .required('部署は必須です')
        .max(50, '部署名は50文字以内で入力してください'),
});