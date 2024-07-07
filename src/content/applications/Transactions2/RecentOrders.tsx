import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, TextField, Box } from '@mui/material';
import RecentOrdersTable, { CryptoOrder } from './RecentOrdersTable';

interface CryptoOrderResponse {
  content: CryptoOrder[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
}

function RecentOrders() {
  const [cryptoOrders, setCryptoOrders] = useState<CryptoOrderResponse>({
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: 20,
    },
    totalElements: 0,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchCryptoOrders = useCallback(async (pageNumber: number, pageSize: number, search: string = '') => {
    try {
      const response = await axios.get<CryptoOrderResponse>(
        `http://localhost:8080/validlogs?page=${pageNumber}&size=${pageSize}&filter=${search}`
      );
      setCryptoOrders(response.data);
    } catch (error) {
      console.error('Error fetching crypto orders:', error);
    }
  }, []);

  useEffect(() => {
    fetchCryptoOrders(0, 20);
  }, [fetchCryptoOrders]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        fetchCryptoOrders(0, 20, searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchCryptoOrders]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = async (pageNumber: number, pageSize: number) => {
    fetchCryptoOrders(pageNumber, pageSize, searchTerm);
  };

  return (
    <Card>
      <Box p={2}>
        <TextField
          fullWidth
          label="Procurar pelo domínio"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <RecentOrdersTable cryptoOrders={cryptoOrders} onUpdateOrders={handlePageChange} />
    </Card>
  );
}

export default RecentOrders;
