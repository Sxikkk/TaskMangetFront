import React, { ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // Content of the modal (e.g., the form)
  actions?: ReactNode; // Optional action buttons (form buttons are usually inside children)
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm', // Default max width
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} aria-labelledby="modal-dialog-title">
      <DialogTitle sx={{ m: 0, p: 2 }} id="modal-dialog-title">
        <Typography variant="h6" component="div">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}; 