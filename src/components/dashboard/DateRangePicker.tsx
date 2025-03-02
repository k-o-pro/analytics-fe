import React, { useState } from 'react';
import { 
  Box, 
  Button,
  ButtonGroup,
  Paper,
  Popover,
  TextField,
  Typography,
  Stack,
  Divider 
} from '@mui/material';
import { DatePicker } from '@mui/lab';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format, isValid, isAfter, isBefore, parseISO } from 'date-fns';
import { DateRange } from '../../services/gscService';

interface DateRangePickerProps {
  selectedRange: DateRange;
  predefinedRanges: DateRange[];
  onRangeChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  predefinedRanges,
  onRangeChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(
    selectedRange.startDate ? parseISO(selectedRange.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    selectedRange.endDate ? parseISO(selectedRange.endDate) : null
  );
  const [error, setError] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Reset to the current selected range when opening
    setStartDate(selectedRange.startDate ? parseISO(selectedRange.startDate) : null);
    setEndDate(selectedRange.endDate ? parseISO(selectedRange.endDate) : null);
    setError(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePredefinedRangeClick = (range: DateRange) => {
    onRangeChange(range);
    handleClose();
  };

  const handleCustomRangeApply = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (!isValid(startDate) || !isValid(endDate)) {
      setError('Invalid date');
      return;
    }

    if (isAfter(startDate, endDate)) {
      setError('Start date must be before end date');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isAfter(endDate, today)) {
      setError('End date cannot be in the future');
      return;
    }

    // Format dates to ISO string (date part only)
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    onRangeChange({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      label: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
    });

    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<CalendarIcon />}
        size="small"
      >
        {selectedRange.label}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 320 }}>
          <Typography variant="subtitle1" gutterBottom>
            Date Range
          </Typography>

          <ButtonGroup
            orientation="vertical"
            fullWidth
            variant="text"
            sx={{ mb: 2 }}
          >
            {predefinedRanges.map((range) => (
              <Button
                key={range.label}
                onClick={() => handlePredefinedRangeClick(range)}
                sx={{ justifyContent: 'flex-start', py: 1 }}
              >
                {range.label}
              </Button>
            ))}
          </ButtonGroup>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR CUSTOM RANGE
            </Typography>
          </Divider>

          <Stack spacing={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue: Date) => {
                setStartDate(newValue);
                setError(null);
              }}
              renderInput={(params) => <TextField size="small" {...params} fullWidth />}
              maxDate={endDate || undefined}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue);
                setError(null);
              }}
              renderInput={(params) => <TextField size="small" {...params} fullWidth />}
              minDate={startDate || undefined}
              maxDate={new Date()}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button onClick={handleClose} variant="text">
                Cancel
              </Button>
              <Button onClick={handleCustomRangeApply} variant="contained">
                Apply
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;