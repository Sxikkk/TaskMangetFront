// TaskCard.tsx
import { Card, CardContent, Typography, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { parseISO, format } from 'date-fns'
import { FC } from 'react'
import { Task } from '@/entities/task/model/types.ts'

interface TaskCardProps {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
}

const TaskCard: FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body1">{task.description}</Typography>

                {task.createdAt && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Created: {format(parseISO(task.createdAt), 'yyyy-MM-dd HH:mm')}
                    </Typography>
                )}

                {task.dueDate && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: isOverdue ? 'error.main' : 'text.secondary',
                            fontWeight: isOverdue ? 'bold' : 'normal',
                        }}
                    >
                        Due: {format(parseISO(task.dueDate), 'yyyy-MM-dd')}
                    </Typography>
                )}

                <IconButton onClick={() => onEdit(task)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(task.id)}>
                    <DeleteIcon />
                </IconButton>
            </CardContent>
        </Card>
    )
}

export default TaskCard
