// src/pages/ClientsPage.tsx

import { useState, useMemo } from 'react';
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle, DialogActions,
  Divider, Grid, IconButton, InputAdornment, MenuItem, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterStore } from '../store/masterStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Client, ClientStatus } from '../types/master';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  code:         z.string().min(1, 'Required'),
  name:         z.string().min(2, 'Required'),
  displayName:  z.string().min(2, 'Required'),
  companyId:    z.string().min(1, 'Required'),
  type:         z.enum(['Corporate', 'SME', 'Startup', 'Government', 'PSU', 'Individual']),
  gstin:        z.string().min(15, 'Invalid GSTIN').max(15, 'Invalid GSTIN').or(z.literal('')),
  pan:          z.string().min(10, 'Invalid PAN').max(10, 'Invalid PAN').or(z.literal('')),
  industry:     z.string().min(1, 'Required'),
  invoicePrefix: z.string().min(1, 'Required'),
  creditLimit:  z.coerce.number().min(0),
  currency:     z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED']),
  paymentTerms: z.coerce.number().min(0),
  notes:        z.string(),
  status:       z.enum(['Active', 'Inactive', 'On Hold', 'Blacklisted']),
  onboardedDate: z.string().min(1, 'Required'),
  // Primary contact
  pc_name:        z.string().min(1, 'Required'),
  pc_email:       z.string().email('Invalid email'),
  pc_phone:       z.string().min(10, 'Invalid'),
  pc_designation: z.string(),
  // Billing contact
  bc_name:        z.string().min(1, 'Required'),
  bc_email:       z.string().email('Invalid email'),
  bc_phone:       z.string().min(10, 'Invalid'),
  bc_designation: z.string(),
  // Address
  street:  z.string().min(1, 'Required'),
  city:    z.string().min(1, 'Required'),
  state:   z.string().min(1, 'Required'),
  pincode: z.string().min(6, 'Invalid'),
  country: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  code: '', name: '', displayName: '', companyId: '', type: 'Corporate',
  gstin: '', pan: '', industry: '', invoicePrefix: 'INV',
  creditLimit: 0, currency: 'INR', paymentTerms: 30, notes: '',
  status: 'Active', onboardedDate: new Date().toISOString().slice(0, 10),
  pc_name: '', pc_email: '', pc_phone: '', pc_designation: '',
  bc_name: '', bc_email: '', bc_phone: '', bc_designation: '',
  street: '', city: '', state: '', pincode: '', country: 'India',
};

function toForm(c: Client): FormValues {
  return {
    code: c.code, name: c.name, displayName: c.displayName,
    companyId: c.companyId, type: c.type, gstin: c.gstin, pan: c.pan,
    industry: c.industry, invoicePrefix: c.invoicePrefix,
    creditLimit: c.creditLimit, currency: c.currency,
    paymentTerms: c.paymentTerms, notes: c.notes, status: c.status,
    onboardedDate: c.onboardedDate.slice(0, 10),
    pc_name: c.primaryContact.name, pc_email: c.primaryContact.email,
    pc_phone: c.primaryContact.phone, pc_designation: c.primaryContact.designation,
    bc_name: c.billingContact.name, bc_email: c.billingContact.email,
    bc_phone: c.billingContact.phone, bc_designation: c.billingContact.designation,
    street: c.address.street, city: c.address.city, state: c.address.state,
    pincode: c.address.pincode, country: c.address.country,
  };
}

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<ClientStatus, 'success' | 'default' | 'warning' | 'error'> = {
  Active:      'success',
  Inactive:    'default',
  'On Hold':   'warning',
  Blacklisted: 'error',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { clients, companies, addClient, updateClient, deleteClient } = useMasterStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState<ClientStatus | 'All'>('All');
  const [dialogOpen, setDialog] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: BLANK,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.primaryContact.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    reset(BLANK);
    setDialog(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    reset(toForm(c));
    setDialog(true);
  }

  function onSubmit(values: FormValues) {
    const payload = {
      code: values.code, name: values.name, displayName: values.displayName,
      companyId: values.companyId, type: values.type, gstin: values.gstin,
      pan: values.pan, industry: values.industry, invoicePrefix: values.invoicePrefix,
      creditLimit: values.creditLimit, currency: values.currency,
      paymentTerms: values.paymentTerms, notes: values.notes, status: values.status,
      onboardedDate: values.onboardedDate,
      primaryContact: { name: values.pc_name, email: values.pc_email, phone: values.pc_phone, designation: values.pc_designation },
      billingContact: { name: values.bc_name, email: values.bc_email, phone: values.bc_phone, designation: values.bc_designation },
      address: { street: values.street, city: values.city, state: values.state, pincode: values.pincode, country: values.country },
    };
    if (editing) {
      updateClient(editing.id, payload);
    } else {
      addClient(payload);
    }
    setDialog(false);
  }

  function confirmDelete() {
    if (toDelete) deleteClient(toDelete.id);
    setToDelete(null);
  }

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Client Name', flex: 1.5, minWidth: 180 },
    { field: 'type', headerName: 'Type', width: 110 },
    {
      field: 'companyId', headerName: 'Company', width: 180,
      valueGetter: (_val: unknown, row: Client) => companies.find((c) => c.id === row.companyId)?.displayName ?? row.companyId,
    },
    { field: 'industry', headerName: 'Industry', width: 150 },
    {
      field: 'creditLimit', headerName: 'Credit Limit', width: 130, type: 'number',
      valueFormatter: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    { field: 'paymentTerms', headerName: 'Pay Terms', width: 100, valueFormatter: (val: number) => `${val} days` },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p: GridRenderCellParams<Client, ClientStatus>) => (
        <Chip label={p.value} size="small" color={STATUS_COLOR[p.value!]} variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: '_actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams<Client>) => (
        <Stack direction="row" spacing={0}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row as Client); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setToDelete(p.row as Client); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
            <PeopleOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            <Typography variant="h5" fontWeight={700}>Clients</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} of {clients.length} clients
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} disableElevation>
          Add Client
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search name, code, GSTIN…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {(['All', 'Active', 'Inactive', 'On Hold', 'Blacklisted'] as const).map((s) => (
            <Chip key={s} label={s} size="small" clickable
              variant={statusFilter === s ? 'filled' : 'outlined'}
              color={statusFilter === s ? 'primary' : 'default'}
              onClick={() => setStatus(s)}
            />
          ))}
        </Stack>
      </Stack>

      {/* Grid */}
      <DataGrid
        rows={filtered} columns={columns} getRowId={(r) => r.id}
        autoHeight density="compact" disableRowSelectionOnClick
        onRowClick={(p) => openEdit(p.row as Client)}
        initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
        pageSizeOptions={[10, 15, 25, 50]}
        sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="client-form" onSubmit={handleSubmit(onSubmit)}>

            {/* Basic Info */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Basic Information</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Controller name="code" control={control} render={({ field }) => (
                  <TextField {...field} label="Client Code" size="small" fullWidth required error={!!errors.code} helperText={errors.code?.message} />
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="invoicePrefix" control={control} render={({ field }) => (
                  <TextField {...field} label="Invoice Prefix" size="small" fullWidth required error={!!errors.invoicePrefix} helperText={errors.invoicePrefix?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Legal Name" size="small" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="displayName" control={control} render={({ field }) => (
                  <TextField {...field} label="Display Name" size="small" fullWidth required error={!!errors.displayName} helperText={errors.displayName?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="companyId" control={control} render={({ field }) => (
                  <TextField {...field} label="Our Company" size="small" fullWidth required select error={!!errors.companyId} helperText={errors.companyId?.message}>
                    {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.displayName}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="type" control={control} render={({ field }) => (
                  <TextField {...field} label="Client Type" size="small" fullWidth select>
                    {['Corporate', 'SME', 'Startup', 'Government', 'PSU', 'Individual'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="status" control={control} render={({ field }) => (
                  <TextField {...field} label="Status" size="small" fullWidth select>
                    {['Active', 'Inactive', 'On Hold', 'Blacklisted'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="industry" control={control} render={({ field }) => (
                  <TextField {...field} label="Industry" size="small" fullWidth required error={!!errors.industry} helperText={errors.industry?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="onboardedDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Onboarded Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} required />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Tax Registration */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Tax Registration</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="gstin" control={control} render={({ field }) => (
                  <TextField {...field} label="GSTIN" size="small" fullWidth inputProps={{ style: { textTransform: 'uppercase' } }} error={!!errors.gstin} helperText={errors.gstin?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="pan" control={control} render={({ field }) => (
                  <TextField {...field} label="PAN" size="small" fullWidth inputProps={{ style: { textTransform: 'uppercase' } }} error={!!errors.pan} helperText={errors.pan?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Primary Contact */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Primary Contact</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="pc_name" control={control} render={({ field }) => (
                  <TextField {...field} label="Name" size="small" fullWidth required error={!!errors.pc_name} helperText={errors.pc_name?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="pc_designation" control={control} render={({ field }) => (
                  <TextField {...field} label="Designation" size="small" fullWidth />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="pc_email" control={control} render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth required type="email" error={!!errors.pc_email} helperText={errors.pc_email?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="pc_phone" control={control} render={({ field }) => (
                  <TextField {...field} label="Phone" size="small" fullWidth error={!!errors.pc_phone} helperText={errors.pc_phone?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Billing Contact */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Billing Contact</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="bc_name" control={control} render={({ field }) => (
                  <TextField {...field} label="Name" size="small" fullWidth required error={!!errors.bc_name} helperText={errors.bc_name?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="bc_designation" control={control} render={({ field }) => (
                  <TextField {...field} label="Designation" size="small" fullWidth />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="bc_email" control={control} render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth required type="email" error={!!errors.bc_email} helperText={errors.bc_email?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="bc_phone" control={control} render={({ field }) => (
                  <TextField {...field} label="Phone" size="small" fullWidth error={!!errors.bc_phone} helperText={errors.bc_phone?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Address */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Address</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Controller name="street" control={control} render={({ field }) => (
                  <TextField {...field} label="Street Address" size="small" fullWidth required error={!!errors.street} helperText={errors.street?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller name="city" control={control} render={({ field }) => (
                  <TextField {...field} label="City" size="small" fullWidth required error={!!errors.city} helperText={errors.city?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller name="state" control={control} render={({ field }) => (
                  <TextField {...field} label="State" size="small" fullWidth required error={!!errors.state} helperText={errors.state?.message} />
                )} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller name="pincode" control={control} render={({ field }) => (
                  <TextField {...field} label="Pincode" size="small" fullWidth required error={!!errors.pincode} helperText={errors.pincode?.message} />
                )} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <Controller name="country" control={control} render={({ field }) => (
                  <TextField {...field} label="Country" size="small" fullWidth required />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Commercial */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Commercial Terms</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Controller name="creditLimit" control={control} render={({ field }) => (
                  <TextField {...field} label="Credit Limit" size="small" fullWidth type="number" inputProps={{ min: 0 }} />
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="paymentTerms" control={control} render={({ field }) => (
                  <TextField {...field} label="Payment Terms (days)" size="small" fullWidth type="number" inputProps={{ min: 0 }} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <TextField {...field} label="Currency" size="small" fullWidth select>
                    {['INR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="notes" control={control} render={({ field }) => (
                  <TextField {...field} label="Notes" size="small" fullWidth multiline rows={2} />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog(false)} color="inherit" variant="outlined" size="small">Cancel</Button>
          <Button type="submit" form="client-form" variant="contained" size="small" disableElevation>
            {editing ? 'Save Changes' : 'Create Client'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Client"
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
}
