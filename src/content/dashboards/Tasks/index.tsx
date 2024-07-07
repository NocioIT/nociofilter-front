import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import Footer from 'src/components/Footer';
import {
  Button,
  Container,
  Card,
  Box,
  Grid,
  TextField,
  CircularProgress,
  Snackbar,
  Typography,
  Alert,
  styled
} from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

const UploadButton = styled('label')(
  ({ theme }) => `
    display: inline-block;
    background-color: ${theme.palette.success.main};
    color: ${theme.palette.common.white};
    padding: 12px 24px;
    cursor: pointer;
    border-radius: ${theme.shape.borderRadius}px;
    text-align: center;
    transition: background-color 0.3s;

    &:hover {
      background-color: ${theme.palette.success.dark};
    }
  `
);

const HiddenFileInput = styled('input')`
  display: none;
`;

function DashboardTasks() {
  const [filter, setFilter] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor, selecione um arquivo para fazer upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filter', filter);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/logs/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setOpenSnackbar(true);
        setTimeout(() => {
          setOpenSnackbar(false);
        }, 3000);
      } else {
        alert('Falha ao enviar arquivo.');
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      alert('Erro ao enviar arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <Helmet>
        <title>Tasks Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Card variant="outlined">
          <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box p={4}>
                <TextField
                  fullWidth
                  label="Filtro"
                  variant="outlined"
                  value={filter}
                  onChange={handleFilterChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box p={4}>
                <HiddenFileInput
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  id="upload-file-input"
                />
                <UploadButton htmlFor="upload-file-input">
                  Upload do Ficheiro
                </UploadButton>
                {fileName && <Box p={2}>{fileName}</Box>}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box p={4} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                >
                  Confirmar Upload
                </Button>
              </Box>
              {loading && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  ml={2}
                >
                  <CircularProgress size={24} style={{ marginLeft: 15, marginRight: 15 }} />
                  <Typography variant="body1" color="textSecondary" align="center" marginBottom={5} marginTop={5}>
                    Não feches a página, o ficheiro está a ser carregado e pode demorar alguns minutos consoante o tamanho do mesmo.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Card>
      </Container>
      <Footer />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={null}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Upload com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}

export default DashboardTasks;