import { Role, User } from "../types"
import { createColumnHelper, flexRender, getCoreRowModel, RowData, useReactTable } from '@tanstack/react-table'
import { Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Tanstack Tableのmeta紐付け
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData>  {
        onEdit?: (id: number) => void;
        onDelete?: (id: number) => void;
    }
}
const roleLabels: Record<Role, { label: string, color: 'error' | 'warning' | 'info' }> = {
    admin: { label: '管理者', color: 'error'},
    editor: { label: '編集者', color: 'warning'},
    viewer: { label: '閲覧者', color: 'info'},
}

const columnHelper = createColumnHelper<User>();

// カラム定義
const columns = [
    columnHelper.accessor('name', {
        header: '名前',
    }),
    columnHelper.accessor('email', {
        header: 'メール'
    }),
    columnHelper.accessor('role', {
        header: '権限',
        cell: (info) => {
            const role = info.getValue();
            return (
                <Chip 
                    label={roleLabels[role].label}    
                    color={roleLabels[role].color}  
                    size="small"  
                />
            )
        }
    }),
    columnHelper.accessor('department', {
        header: '部署'
    }),
    columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: ({ row, table }) => {
            // metaからコールバックを取得
            const { onEdit, onDelete } = table.options.meta ?? {} ;
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit?.(row.original.id)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete?.(row.original.id)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    })
]

type UserTableProps = {
    users: User[];
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
}

const UserTable = ({ users, onDelete, onEdit }: UserTableProps) => {
    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            onEdit,
            onDelete,
        },
    })

    return (
        <TableContainer component={Paper}>
            <Table>
                {/* ヘッダー */}
                <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableCell key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                 {/* データ */}
                 <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                 </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserTable