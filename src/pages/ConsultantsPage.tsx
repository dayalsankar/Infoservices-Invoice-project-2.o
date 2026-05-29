// src/pages/ConsultantsPage.tsx

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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterStore } from '../store/masterStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Consultant, ConsultantStatus } from '../types/master';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  employeeId:      z.string().min(1, 'Required'),
  name:            z.string().min(2, 'Required'),
  email:           z.string().email('Invalid email'),
  phone:           z.string().min(10, 'Invalid'),
  designation:     z.string().min(1, 'Required'),
  department:      z.string().min(1, 'Required'),
  type:            z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  skills:          z.string(),
  technologies:    z.string(),
  joiningDate:     z.string().min(1, 'Required'),
  experienceYears: z.coerce.number().min(0),
  billingRate:     z.coerce.number().min(0),
  rateType:        z.enum(['Hourly', 'Daily', 'Monthly']),
  currency:        z.enum(['INR', 'USD']),
  managerId:       z.string(),
  managerName:     z.string().min(1, 'Required'),
  companyId:       z.string().min(1, 'Required'),
  status:          z.enum(['Active', 'On Bench', 'On Leave', 'Terminated', 'Resigned']),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  employeeId: '', name: '', email: '', phone: '',
  designation: '', department: '', type: 'Full-time',
  skills: '', technologies: '', joiningDate: new Date().toISOString().slice(0, 10),
  experienceYears: 0, billingRate: 0, rateType: 'Monthly',
  currency: 'INR', managerId: '', managerName: '', companyId: '', status: 'Active',
};

function toForm(c: Consultant): FormValues {
  return {
    employeeId: c.employeeId, name: c.name, email: c.email, phone: c.phone,
    designation: c.designation, department: c.department, type: c.type,
    skills: c.skills.join(', '), technologies: c.technologies.join(', '),
    joiningDate: c.joiningDate.slice(0, 10),
    experienceYears: c.experienceYears, billingRate: c.billingRate,
    rateType: c.rateType, currency: c.currency,
    managerId: c.managerId, managerName: c.managerName,
    companyId: c.companyId, status: c.status,
  };
}

function splitTags(s: string): string[] {
  return s.split(',').map((t) => t.trim()).filter(Boolean);
}

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<ConsultantStatus, 'success' | 'default' | 'warning' | 'error' | 'info'> = {
  Active:     'success',
  'On Bench': 'info',
  'On Leave': 'warning',
  Terminated: 'error',
  Resigned:   'default',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConsultantsPage() {
  const { consultants, companies, addConsultant, updateConsultant, deleteConsultant } = useMasterStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState<ConsultantStatus | 'All'>('All');
  const [dialogOpen, setDialog] = useState(false);
  const [editing, setEditing] = useState<Consultant | null>(null);
  const [toDelete, setToDelete] = useState<Consultant | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: BLANK,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return consultants.filter((c) => {
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q) ||
        c.designation.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [consultants, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    reset(BLANK);
    setDialog(true);
  }

  function openEdit(c: Consultant) {
    setEditing(c);
    reset(toForm(c));
    setDialog(true);
  }

  function onSubmit(values: FormValues) {
    const payload = {
      employeeId: values.employeeId, name: values.name, email: values.email,
      phone: values.phone, designation: values.designation, department: values.department,
      type: values.type, skills: splitTags(values.skills),
      technologies: splitTags(values.technologies),
      joiningDate: values.joiningDate, experienceYears: values.experienceYears,
      billingRate: values.billingRate, rateType: values.rateType,
      currency: values.currency, managerId: values.managerId,
      managerName: values.managerName, companyId: values.companyId, status: values.status,
    };
    if (editing) {
      updateConsultant(editing.id, payload);
    } else {
      addConsultant(payload);
    }
    setDialog(false);
  }

  function confirmDelete() {
    if (toDelete) deleteConsultant(toDelete.id);
    setToDelete(null);
  }

  const columns: GridColDef[] = [
    { field: 'employeeId', headerName: 'Emp ID', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'designation', headerName: 'Designation', flex: 1, minWidth: 150 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'type', headerName: 'Type', width: 110 },
    {
      field: 'billingRate', headerName: 'Rate', width: 110, type: 'number',
      valueGetter: (_val: unknown, row: Consultant) =>
        `${row.currency === 'INR' ? '₹' : '$'}${row.billingRate.toLocaleString('en-IN')}/${row.rateType === 'Hourly' ? 'hr' : row.rateType === 'Daily' ? 'day' : 'mo'}`,
    },
    { field: 'experienceYears', headerName: 'Exp (yrs)', width: 95, type: 'number' },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p: GridRenderCellParams<Consultant, ConsultantStatus>) => (
        <Chip label={p.value} size="small" color={STATUS_COLOR[p.value!]} variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: '_actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams<Consultant>) => (
        <Stack direction="row" spacing={0}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row as Consultant); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setToDelete(p.row as Consultant); }}>
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
            <PersonOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            <Typography variant="h5" fontWeight={700}>Consultants</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} of {consultants.length} consultants
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} disableElevation>
          Add Consultant
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search name, ID, designation…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {(['All', 'Active', 'On Bench', 'On Leave', 'Terminated', 'Resigned'] as const).map((s) => (
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
        onRowClick={(p) => openEdit(p.row as Consultant)}
        initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
        pageSizeOptions={[10, 15, 25, 50]}
        sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Consultant' : 'New Consultant'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="consultant-form" onSubmit={handleSubmit(onSubmit)}>

            {/* Identity */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Identity</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Controller name="employeeId" control={control} render={({ field }) => (
                  <TextField {...field} label="Employee ID" size="small" fullWidth required error={!!errors.employeeId} helperText={errors.employeeId?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={9}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Full Name" size="small" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="email" control={control} render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth required type="email" error={!!errors.email} helperText={errors.email?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="phone" control={control} render={({ field }) => (
                  <TextField {...field} label="Phone" size="small" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Role */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Role & Employment</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="designation" control={control} render={({ field }) => (
                  <TextField {...field} label="Designation" size="small" fullWidth required error={!!errors.designation} helperText={errors.designation?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="department" control={control} render={({ field }) => (
                  <TextField {...field} label="Department" size="small" fullWidth required error={!!errors.department} helperText={errors.department?.message} />
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="type" control={control} render={({ field }) => (
                  <TextField {...field} label="Employment Type" size="small" fullWidth select>
                    {['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="status" control={control} render={({ field }) => (
                  <TextField {...field} label="Status" size="small" fullWidth select>
                    {['Active', 'On Bench', 'On Leave', 'Terminated', 'Resigned'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="joiningDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Joining Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} required />
                )} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name="experienceYears" control={control} render={({ field }) => (
                  <TextField {...field} label="Experience (yrs)" size="small" fullWidth type="number" inputProps={{ min: 0, step: 0.5 }} />
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
                <Controller name="managerName" control={control} render={({ field }) => (
                  <TextField {...field} label="Reporting Manager" size="small" fullWidth required error={!!errors.managerName} helperText={errors.managerName?.message} />
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Billing */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>Billing Rate</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={4}>
                <Controller name="billingRate" control={control} render={({ field }) => (
                  <TextField {...field} label="Billing Rate" size="small" fullWidth type="number" inputProps={{ min: 0 }} />
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="rateType" control={control} render={({ field }) => (
                  <TextField {...field} label="Rate Type" size="small" fullWidth select>
                    {['Hourly', 'Daily', 'Monthly'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <TextField {...field} label="Currency" size="small" fullWidth select>
                    {['INR', 'USD'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Skills */}
            <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>Skills & Technologies</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Separate multiple entries with commas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller name="skills" control={control} render={({ field }) => (
                  <TextField {...field} label="Skills" size="small" fullWidth placeholder="e.g. Java, Spring Boot, Microservices" />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="technologies" control={control} render={({ field }) => (
                  <TextField {...field} label="Technologies" size="small" fullWidth placeholder="e.g. AWS, Docker, Kubernetes" />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog(false)} color="inherit" variant="outlined" size="small">Cancel</Button>
          <Button type="submit" form="consultant-form" variant="contained" size="small" disableElevation>
            {editing ? 'Save Changes' : 'Create Consultant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Consultant"
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
}
