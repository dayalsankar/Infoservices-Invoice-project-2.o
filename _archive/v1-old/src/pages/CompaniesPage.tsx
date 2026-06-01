'use client';
// src/pages/CompaniesPage.tsx — Full CRUD for Company master records

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { useMasterStore } from '../store/masterStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Company, CompanyStatus } from '../types/master';

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<CompanyStatus, 'success' | 'warning' | 'error'> = {
  Active: 'success', Inactive: 'warning', Suspended: 'error',
};

// ─── Form defaults ────────────────────────────────────────────────────────────

const BLANK: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
  code: '', name: '', displayName: '', type: 'Pvt Ltd', gstin: '', pan: '', tan: '', cin: '',
  incorporationDate: '', contactEmail: '', contactPhone: '', website: '', industry: '',
  currency: 'INR', paymentTerms: 30, billingCycle: 'Monthly',
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
  bankDetails: { bankName: '', accountNumber: '', ifscCode: '', accountType: 'Current', branchName: '' },
  status: 'Active',
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useMasterStore();

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<CompanyStatus | 'All'>('All');
  const [dialogOpen, setDialog]   = useState(false);
  const [editing, setEditing]     = useState<Company | null>(null);
  const [toDelete, setToDelete]   = useState<Company | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: BLANK,
  });

  const rows = useMemo(() => {
    let list = companies;
    if (statusFilter !== 'All') list = list.filter((c) => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.pan.toLowerCase().includes(q),
      );
    }
    return list;
  }, [companies, search, statusFilter]);

  const openCreate = () => { reset(BLANK); setEditing(null); setDialog(true); };
  const openEdit   = (row: Company) => { reset(row); setEditing(row); setDialog(true); };
  const closeDialog = () => setDialog(false);

  const onSubmit = (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) updateCompany(editing.id, data);
    else addCompany(data);
    setDialog(false);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 90 },
    { field: 'name', headerName: 'Company Name', flex: 1, minWidth: 220 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'gstin', headerName: 'GSTIN', width: 180 },
    { field: 'industry', headerName: 'Industry', width: 180 },
    {
      field: 'paymentTerms', headerName: 'Pay Terms', width: 110,
      renderCell: (p: GridRenderCellParams) => `Net-${p.value as number}`,
    },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p: GridRenderCellParams) => (
        <Chip label={p.value as string} size="small" color={STATUS_COLOR[p.value as CompanyStatus]} variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row as Company); }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setToDelete(p.row as Company); }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
            <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="h5" fontWeight={700}>Companies</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Manage company master records, GST details, and billing configurations
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />} color="inherit">Export</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} disableElevation onClick={openCreate}>Add Company</Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          size="small" placeholder="Search name, code, GSTIN…" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ width: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {(['All', 'Active', 'Inactive', 'Suspended'] as const).map((s) => (
          <Chip key={s} label={s} size="small" onClick={() => setStatus(s)}
            variant={statusFilter === s ? 'filled' : 'outlined'}
            color={statusFilter === s ? 'primary' : 'default'}
            sx={{ cursor: 'pointer', fontWeight: 500 }} />
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
          {rows.length} result{rows.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>

      {/* Grid */}
      <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          rows={rows} columns={columns} getRowId={(r) => r.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(p: GridRowParams) => openEdit(p.row as Company)}
          disableRowSelectionOnClick
          sx={{ border: 'none', '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Company' : 'Add Company'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box component="form" id="company-form" onSubmit={handleSubmit(onSubmit)}>

            <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>Basic Info</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="code" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Code *" size="small" error={!!errors.code} helperText={errors.code?.message} sx={{ width: 120 }} inputProps={{ style: { textTransform: 'uppercase' } }} />}
              />
              <Controller name="name" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Legal Name *" size="small" error={!!errors.name} helperText={errors.name?.message} fullWidth />}
              />
              <Controller name="displayName" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Display Name *" size="small" error={!!errors.displayName} helperText={errors.displayName?.message} sx={{ width: 200 }} />}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="type" control={control}
                render={({ field }) => (
                  <FormControl size="small" sx={{ width: 180 }}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      {['Pvt Ltd','LLP','Public Ltd','Sole Proprietorship','Partnership','OPC','Trust'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller name="industry" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Industry *" size="small" error={!!errors.industry} helperText={errors.industry?.message} fullWidth />}
              />
              <Controller name="status" control={control}
                render={({ field }) => (
                  <FormControl size="small" sx={{ width: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {['Active','Inactive','Suspended'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>Registration</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="gstin" control={control}
                render={({ field }) => <TextField {...field} label="GSTIN" size="small" fullWidth inputProps={{ maxLength: 15, style: { textTransform: 'uppercase' } }} />}
              />
              <Controller name="pan" control={control}
                render={({ field }) => <TextField {...field} label="PAN" size="small" sx={{ width: 150 }} inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} />}
              />
              <Controller name="tan" control={control}
                render={({ field }) => <TextField {...field} label="TAN" size="small" sx={{ width: 150 }} inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} />}
              />
              <Controller name="cin" control={control}
                render={({ field }) => <TextField {...field} label="CIN" size="small" sx={{ width: 200 }} inputProps={{ style: { textTransform: 'uppercase' } }} />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="incorporationDate" control={control}
                render={({ field }) => <TextField {...field} label="Incorporation Date" size="small" type="date" InputLabelProps={{ shrink: true }} sx={{ width: 200 }} />}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>Address</Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Controller name="address.street" control={control}
                render={({ field }) => <TextField {...field} label="Street / Building" size="small" fullWidth />}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller name="address.city" control={control}
                  render={({ field }) => <TextField {...field} label="City" size="small" fullWidth />}
                />
                <Controller name="address.state" control={control}
                  render={({ field }) => <TextField {...field} label="State" size="small" fullWidth />}
                />
                <Controller name="address.pincode" control={control}
                  render={({ field }) => <TextField {...field} label="Pincode" size="small" sx={{ width: 130 }} />}
                />
                <Controller name="address.country" control={control}
                  render={({ field }) => <TextField {...field} label="Country" size="small" sx={{ width: 130 }} />}
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>Contact & Commercial</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="contactEmail" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Contact Email *" size="small" type="email" error={!!errors.contactEmail} helperText={errors.contactEmail?.message} fullWidth />}
              />
              <Controller name="contactPhone" control={control} rules={{ required: 'Required' }}
                render={({ field }) => <TextField {...field} label="Contact Phone *" size="small" error={!!errors.contactPhone} helperText={errors.contactPhone?.message} sx={{ width: 200 }} />}
              />
              <Controller name="website" control={control}
                render={({ field }) => <TextField {...field} label="Website" size="small" fullWidth />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="currency" control={control}
                render={({ field }) => (
                  <FormControl size="small" sx={{ width: 100 }}>
                    <InputLabel>Currency</InputLabel>
                    <Select {...field} label="Currency">
                      {['INR','USD','EUR','GBP','AED'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller name="paymentTerms" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Payment Terms (days)" size="small" type="number" sx={{ width: 200 }}
                    onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
              <Controller name="billingCycle" control={control}
                render={({ field }) => (
                  <FormControl size="small" sx={{ width: 160 }}>
                    <InputLabel>Billing Cycle</InputLabel>
                    <Select {...field} label="Billing Cycle">
                      {['Monthly','Bi-Monthly','Quarterly','Milestone'].map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>Bank Details</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Controller name="bankDetails.bankName" control={control}
                render={({ field }) => <TextField {...field} label="Bank Name" size="small" fullWidth />}
              />
              <Controller name="bankDetails.accountNumber" control={control}
                render={({ field }) => <TextField {...field} label="Account Number" size="small" sx={{ width: 200 }} />}
              />
              <Controller name="bankDetails.ifscCode" control={control}
                render={({ field }) => <TextField {...field} label="IFSC Code" size="small" sx={{ width: 150 }} inputProps={{ style: { textTransform: 'uppercase' } }} />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="bankDetails.accountType" control={control}
                render={({ field }) => (
                  <FormControl size="small" sx={{ width: 140 }}>
                    <InputLabel>Account Type</InputLabel>
                    <Select {...field} label="Account Type">
                      <MenuItem value="Current">Current</MenuItem>
                      <MenuItem value="Savings">Savings</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller name="bankDetails.branchName" control={control}
                render={({ field }) => <TextField {...field} label="Branch Name" size="small" sx={{ width: 250 }} />}
              />
            </Stack>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={closeDialog} color="inherit" variant="outlined" size="small">Cancel</Button>
          <Button type="submit" form="company-form" variant="contained" size="small" disableElevation>
            {editing ? 'Save Changes' : 'Add Company'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Company"
        message={`Delete "${toDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => { if (toDelete) { deleteCompany(toDelete.id); setToDelete(null); } }}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
}
