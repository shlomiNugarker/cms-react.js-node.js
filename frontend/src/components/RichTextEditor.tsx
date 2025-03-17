import React from 'react';
import { TextField } from '@mui/material';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
  minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialValue, 
  onChange, 
  minHeight = 300 
}) => {
  return (
    <TextField
      multiline
      fullWidth
      variant="outlined"
      value={initialValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      minRows={10}
      sx={{ 
        '& .MuiOutlinedInput-root': {
          minHeight: minHeight
        }
      }}
    />
  );
}; 