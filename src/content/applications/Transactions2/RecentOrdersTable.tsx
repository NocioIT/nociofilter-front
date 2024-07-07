import React, { FC, useState, useEffect } from 'react';
import {
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Tooltip,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Importar ícone de cópia

import axios from 'axios';

export interface CryptoOrder {
  id: number;
  url: string;
  email: string;
  password: string;
  valid: boolean;
}

interface RecentOrdersTableProps {
  cryptoOrders: {
    content: CryptoOrder[];
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    totalElements: number;
  };
  onUpdateOrders: (pageNumber: number, pageSize: number) => void;
}

const extractDomain = (url: string): string => {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i);
  return match ? match[1] : 'N/A';
};

const RecentOrdersTable: FC<RecentOrdersTableProps> = ({ cryptoOrders, onUpdateOrders }) => {
  const [page, setPage] = useState<number>(cryptoOrders.pageable.pageNumber);
  const [rowsPerPage, setRowsPerPage] = useState<number>(cryptoOrders.pageable.pageSize);
  const [orders, setOrders] = useState<CryptoOrder[]>(cryptoOrders.content);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    setPage(cryptoOrders.pageable.pageNumber); // Atualizar o estado da página quando os pedidos são atualizados
    setRowsPerPage(cryptoOrders.pageable.pageSize); // Atualizar o estado do tamanho da página quando os pedidos são atualizados
    setOrders(cryptoOrders.content); // Atualizar o estado dos pedidos quando os pedidos são atualizados
  }, [cryptoOrders]);

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage);
    await onUpdateOrders(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setPage(0); // Reset page number when rows per page changes
    await onUpdateOrders(0, newPageSize);
  };

  const handleNextPage = async () => {
    const nextPageNumber = page + 1;
    setPage(nextPageNumber);
    await onUpdateOrders(nextPageNumber, rowsPerPage);
  };

  const handlePreviousPage = async () => {
    const previousPageNumber = page - 1;
    setPage(previousPageNumber);
    await onUpdateOrders(previousPageNumber, rowsPerPage);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    });
  };

  const abbreviate = (text: string, length: number) => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  const handleValidChange = async (id: number, valid: boolean) => {
    try {
      await axios.patch('http://localhost:8080/validlogs', { id, valid });
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === id ? { ...order, valid } : order))
      );
      setSnackbarOpen(true);

      // Request de delete após a atualização de validade bem-sucedida
      await axios.delete(`http://localhost:8080/validlogs/${id}`);
    } catch (error) {
      console.error('Error updating validity:', error);
      alert(`Failed to update validity: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/validlogs/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Failed to delete order: ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!Array.isArray(cryptoOrders.content)) {
    console.error('cryptoOrders.content is not an array:', cryptoOrders.content);
    return null;
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email/Username</TableCell>
              <TableCell>Senha</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Domínio</TableCell>
              <TableCell>Válido</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Tooltip title={order.email}>
                    <span>
                      {abbreviate(order.email, 15)}
                      {order.email.length > 15 && (
                        <IconButton
                          onClick={() => handleCopy(order.email)}
                          size="small"
                          style={{ marginLeft: '5px' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={order.password}>
                    <span>
                      {abbreviate(order.password, 15)}
                      {order.password.length > 15 && (
                        <IconButton
                          onClick={() => handleCopy(order.password)}
                          size="small"
                          style={{ marginLeft: '5px' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <a href={order.url} target="_blank" rel="noopener noreferrer">
                    Clique
                  </a>
                </TableCell>
                <TableCell>{extractDomain(order.url)}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={order.valid}
                    onChange={(e) => handleValidChange(order.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Excluir Pedido" arrow>
                    <IconButton onClick={() => handleDelete(order.id)}>
                      <DeleteTwoToneIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[20, 50, 100]}
        component="div"
        count={cryptoOrders.totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={() => (
          <div>
            <IconButton
              onClick={handlePreviousPage}
              disabled={page === 0}
              aria-label="previous page"
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={handleNextPage}
              disabled={page >= Math.ceil(cryptoOrders.totalElements / rowsPerPage) - 1}
              aria-label="next page"
            >
              <NavigateNextIcon />
            </IconButton>
          </div>
        )}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Marcado como válido com sucesso!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default RecentOrdersTable;
