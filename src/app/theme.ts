'use client'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    fontFamily: "'Crimson Text', 'Noto Serif JP', 'Times New Roman', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif",
  },
  palette: {
    background: {
      default: '#f7fafd',
    },
  },
})

export default theme