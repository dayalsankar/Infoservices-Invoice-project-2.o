// src/pages/AssignmentsPage.tsx

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
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterStore } from '../store/masterStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Assignment, AssignmentStatus } from '../types/master';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  assignmentCode:      z.string().min(1, 'Required'),
  consultantId:        z.string().min(1, 'Required'),
  clientId:            z.string().min(1, 'Required'),
  companyId:           z.string().min(1, 'Required'),
  projectName:         z.string().min(1, 'Required'),
  sowNumber:           z.string(),
  startDate:           z.string().min(1, 'Required'),
  endDate:             z.string().min(1, 'Required'),
  billingType:         z.enum(['Time & Material', 'Fixed Price', 'Retainer', 'Milestone']),
  billingRate:         z.coerce.number().min(0),
  currency:            z.enum(['INR', 'USD']),
  allottedHours:       z.coerce.number().min(0),
  deliveryManagerName: z.string().min(1, 'Required'),
  deliveryManagerId:   z.string(),
  status:              z.enum(['Active', 'Completed', 'On Hold', 'Cancelled', 'Upcoming']),
  description:         z.string(),
  notes:               z.string(),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  assignmentCode: '', consultantId: '', clientId: '', companyId: '',
  projectName: '', sowNumber: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  billingType: 'Time & Material', billingRate: 0, currency: 'INR',
  allottedHours: 0, deliveryManagerName: '', deliveryManagerId: '',
  status: 'Upcoming', description: '', notes: '',
};

function toForm(a: Assignment): FormValues {
  return {
    assignmentCode: a.assignmentCode, consultantId: a.consultantId,
    clientId: a.clientId, companyId: a.companyId, projectName: a.projectName,
    sowNumber: a.sowNumber, startDate: a.startDate.slice(0, 10),
    endDate: a.endDate.slice(0, 10), billingType: a.billingType,
    billingRate: a.billingRate, currency: a.currency,
    allottedHours: a.allottedHours, deliveryManagerName: a.deliveryManagerName,
    deliveryManagerId: a.deliveryManagerId, status: a.status,
    description: a.description, notes: a.notes,
  };
}

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<AssignmentStatus, 'success' | 'default' | 'warning' | 'error' | 'info'> = {
  Active:    'success',
  Completed: 'info',
  'On Hold': 'warning',
  Cancelled: 'error',
  Upcoming:  'default',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignmentsPage() {
  const { assignments, clients, consultants, companies, addAssignment, updateAssignment, deleteAssignment } = useMasterStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState<AssignmentStatus | 'All'>('All');
  const [dialogOpen, setDialog] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [toDelete, setToDelete] = useState<Assignment | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: BLANK,
  });

  // Derive consultant/client names for display from selected IDs
  const selectedConsultantId = watch('consultantId');
  const selectedClientId = watch('clientId');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignments.filter((a) => {
      const matchSearch = !q ||
        a.projectName.toLowerCase().includes(q) ||
        a.assignmentCode.toLowerCase().includes(q) ||
        a.consultantName.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        a.sowNumber.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [assignments, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    reset(BLANK);
    setDialog(true);
  }

  function openEdit(a: Assignment) {
    setEditing(a);
    reset(toForm(a));
    setDialog(true);
  }

  function onSubmit(values: FormValues) {
    const consultant = consultants.find((c) => c.id === values.consultantId);
    const client = clients.find((c) => c.id === values.clientId);
    const payload = {
      assignmentCode: values.assignmentCode,
      consultantId: values.consultantId,
      consultantName: consultant?.name ?? '',
      clientId: values.clientId,
      clientName: client?.name ?? '',
      companyId: values.companyId,
      projectName: values.projectName,
      sowNumber: values.sowNumber,
      startDate: values.startDate,
      endDate: values.endDate,
      billingType: values.billingType,
      billingRate: values.billingRate,
      currency: values.currency,
      allottedHours: values.allottedHours,
      deliveryManagerId: values.deliveryManagerId,
      deliveryManagerName: values.deliveryManagerName,
      status: values.status,
      description: values.description,
      notes: values.notes,
    };
    if (editing) {
      updateAssignment(editing.id, payload);
    } else {
      addAssignment(payload);
    }
    setDialog(false);
  }

  function confirmDelete() {
    if (toDelete) deleteAssignment(toDelete.id);
    setToDelete(null);
  }

  const columns: GridColDef[] = [
    { field: 'assignmentCode', headerName: 'Code', width: 120 },
    { field: 'projectName', headerName: 'Project', flex: 1.5, minWidth: 180 },
    { field: 'consultantName', headerName: 'Consultant', flex: 1, minWidth: 150 },
    { field: 'clientName', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'billingType', headerName: 'Billing Type', width: 150 },
    {
      field: 'billingRate', headerName: 'Rate', width: 110, type: 'number',
      valueGetter: (_val: unknown, row: Assignment) =>
        `${row.currency === 'INR' ? '₹' : '$'}${row.billingRate.toLocaleString('en-IN')}`,
    },
    {
      field: 'startDate', headerName: 'Start', width: 100,
      valueFormatter: (val: string) => val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    },
    {
      field: 'endDate', headerName: 'End', width: 100,
      valueFormatter: (val: string) => val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p: GridRenderCellParams<Assignment, AssignmentStatus>) => (
        <Chip label={p.value} size="small" color={STATUS_COLOR[p.value!]} variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: '_actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams<Assignment>) => (
        <Stack direction="row" spacing={0}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row as Assignment); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setToDelete(p.row as Assignment); }}>
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
            <AssignmentOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            <Typography variant="h5" fontWeight={700}>Assignments</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} of {assignments.length} assignments
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} disableElevation>
          New Assignment
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search project, consultant, client…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 280 }}
        />
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {(['All', 'Active', 'Upcoming', 'Completed', 'On Hold', 'Cancelled'] as const).map((s) => (
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
        onRowClick={(p) => openEdit(p.row as Assignment)}
        initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
        pageSizeOptions={[10, 15, 25, 50]}
        sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Assignment' : 'New Assignment'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="assignment-form" onSubmit={handleSubmit(onSubmit)}>

            {/* Project Details */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Project Details</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={4}>
                <Controller name="assignmentCode" control={control} render={({ field }) => (
                  <TextField {...field} label="Assignment Code" size="small" fullWidth required error={!!errors.assignmentCode} helperText={errors.assignmentCode?.message} />
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="sowNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="SOW Number" size="small" fullWidth />
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="status" control={control} render={({ field }) => (
                  <TextField {...field} label="Status" size="small" fullWidth select>
                    {['Active', 'Upcoming', 'Completed', 'On Hold', 'Cancelled'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="projectName" control={control} render={({ field }) => (
                  <TextField {...field} label="Project Name" size="small" fullWidth required error={!!errors.projectName} helperText={errors.projectName?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="startDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Start Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} required />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="endDate" control={control} render={({ field }) => (
                  <TextField {...field} label="End Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} required error={!!errors.endDate} helperText={errors.endDate?.message} />
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="description" control={control} render={({ field }) => (
                  <TextField {...field} label="Description" size="small" fullWidth multiline rows={2} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* People */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>People</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="consultantId" control={control} render={({ field }) => (
                  <TextField {...field} label="Consultant" size="small" fullWidth required select error={!!errors.consultantId} helperText={errors.consultantId?.message}>
                    {consultants.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} — {c.designation}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="clientId" control={control} render={({ field }) => (
                  <TextField {...field} label="Client" size="small" fullWidth required select error={!!errors.clientId} helperText={errors.clientId?.message}>
                    {clients.map((c) => <MenuItem key={c.id} value={c.id}>{c.displayName}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="companyId" control={control} render={({ field }) => (
                  <TextField {...field} label="Our Company" size="small" fullWidth required select error={!!errors.companyId} helperText={errors.companyId?.message}>
                    {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.displayName}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="deliveryManagerName" control={control} render={({ field }) => (
                  <TextField {...field} label="Delivery Manager" size="small" fullWidth required error={!!errors.deliveryManagerName} helperText={errors.deliveryManagerName?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Billing */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Billing</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Controller name="billingType" control={control} render={({ field }) => (
                  <TextField {...field} label="Billing Type" size="small" fullWidth select>
                    {['Time & Material', 'Fixed Price', 'Retainer', 'Milestone'].map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="billingRate" control={control} render={({ field }) => (
                  <TextField {...field} label="Billing Rate" size="small" fullWidth type="number" inputProps={{ min: 0 }} />
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <TextField {...field} label="Currency" size="small" fullWidth select>
                    {['INR', 'USD'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller name="allottedHours" control={control} render={({ field }) => (
                  <TextField {...field} label="Allotted Hours" size="small" fullWidth type="number" inputProps={{ min: 0 }} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Notes */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Notes</Typography>
            <Controller name="notes" control={control} render={({ field }) => (
              <TextField {...field} label="Internal Notes" size="small" fullWidth multiline rows={2} />
            )} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog(false)} color="inherit" variant="outlined" size="small">Cancel</Button>
          <Button type="submit" form="assignment-form" variant="contained" size="small" disableElevation>
            {editing ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Assignment"
        message={`Delete "${toDelete?.projectName}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
}
