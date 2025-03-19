import React, { useState } from 'react';
import { 
  Box, 
  Button,
  ButtonGroup,
  Paper,
  Popover,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { 
  CalendarToday as CalendarIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { format, isValid, isAfter, parseISO } from 'date-fns';
import { DateRange } from '../../types/api';

interface DateRangePickerProps {
  selectedRange: DateRange;
  predefinedRanges: DateRange[];
  onRangeChange: (range: DateRange, enableComparison?: boolean) => void;
  comparisonEnabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  predefinedRanges,
  onRangeChange,
  comparisonEnabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(
    selectedRange.startDate ? parseISO(selectedRange.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    selectedRange.endDate ? parseISO(selectedRange.endDate) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(comparisonEnabled);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Reset to the current selected range when opening
    setStartDate(selectedRange.startDate ? parseISO(selectedRange.startDate) : null);
    setEndDate(selectedRange.endDate ? parseISO(selectedRange.endDate) : null);
    setError(null);
    setShowComparison(comparisonEnabled);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePredefinedRangeClick = (range: DateRange) => {
    onRangeChange(range, showComparison);
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
    }, showComparison);

    handleClose();
  };

  const toggleComparison = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowComparison(event.target.checked);
  };

  const open = Boolean(anchorEl);

  // Format display text for the button
  const getDisplayText = () => {
    let text = selectedRange.label || '';
    if (comparisonEnabled) {
      text += ' (vs previous)';
    }
    return text;
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<CalendarIcon />}
        endIcon={comparisonEnabled && <CompareIcon color="primary" />}
        size="small"
      >
        {getDisplayText()}
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
                sx={{ 
                  justifyContent: 'flex-start', 
                  py: 1,
                  bgcolor: selectedRange.label === range.label ? 'action.selected' : 'transparent'
                }}
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
              onChange={(newValue: Date | null) => {
                setStartDate(newValue);
                setError(null);
              }}
              {...(endDate ? { maxDate: endDate } : {})}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue: Date | null) => {
                setEndDate(newValue);
                setError(null);
              }}
              {...(startDate ? { minDate: startDate } : {})}
              maxDate={new Date()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showComparison}
                  onChange={toggleComparison}
                  name="compare"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Compare to previous period
                </Typography>
              }
            />

            {showComparison && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Will compare against the same length period immediately before your selection
                </Typography>
              </Box>
            )}

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