import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Paper, Typography, Box, useTheme, CircularProgress } from '@mui/material';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

type MetricType = 'clicks' | 'impressions' | 'ctr' | 'position';

interface PerformanceChartProps {
  data: DataPoint[];
  metrics: MetricType[];
  title: string;
  height?: number;
  isLoading?: boolean;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 2, maxWidth: 200 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
        </Typography>
        {payload.map((entry) => (
          <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: entry.color,
                mr: 1,
              }}
            />
            <Typography variant="body2">
              {entry.name}: {formatValue(entry.name as MetricType, entry.value as number)}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

// Helper function to format values based on metric type
const formatValue = (metricType: MetricType, value: number): string => {
  switch (metricType) {
    case 'ctr':
      return `${(value * 100).toFixed(2)}%`;
    case 'position':
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  metrics,
  title,
  height = 350,
  isLoading = false,
}) => {
  const theme = useTheme();

  // Better data validation and formatting
  const validData = React.useMemo(() => {
    return data
      .filter(item => {
        try {
          // Check if item has keys array (from GSC API format)
          if (Array.isArray(item.keys) && item.keys.length > 0) {
            return true;
          }
          
          // Or check if it has a direct date property
          const validDate = item.date && !isNaN(new Date(item.date).getTime());
          const hasMetrics = metrics.some(metric => typeof item[metric] === 'number');
          return validDate && hasMetrics;
        } catch (e) {
          console.error('Invalid data point:', item);
          return false;
        }
      })
      .map(item => {
        // Determine the date (either from keys array or direct date property)
        let dateValue = item.date;
        
        // If we have keys array from GSC API format, use the first key as date
        if (Array.isArray(item.keys) && item.keys.length > 0) {
          dateValue = item.keys[0];
        }
        
        return {
          // Add all existing properties
          ...item,
          // Format date consistently
          date: format(new Date(dateValue), 'yyyy-MM-dd'),
          // Ensure all metrics are numbers
          ...metrics.reduce((acc, metric) => ({
            ...acc,
            [metric]: typeof item[metric] === 'number' ? item[metric] : 0
          }), {})
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, metrics]);

  // Add console logs for debugging
  React.useEffect(() => {
    console.log('Chart data:', {
      originalData: data,
      validData,
      metrics,
    });
  }, [data, validData, metrics]);

  const colorMap: Record<MetricType, string> = {
    clicks: theme.palette.primary.main,
    impressions: theme.palette.secondary.main,
    ctr: theme.palette.success.main,
    position: theme.palette.error.main,
  };

  const yAxisConfig = (metric: MetricType) => {
    switch (metric) {
      case 'ctr':
        return {
          tickFormatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          // Change domain to match AxisDomain type
          domain: [0, (dataMax: number) => Math.min(Math.ceil(dataMax * 1.1 * 100) / 100, 1)] as [number, (dataMax: number) => number],
        };
      case 'position':
        return {
          // Change domain to match AxisDomain type
          domain: [(dataMin: number) => Math.floor(dataMin * 0.9), (dataMax: number) => Math.ceil(dataMax * 1.1)] as [(dataMin: number) => number, (dataMax: number) => number],
          reversed: true,
        };
      default:
        return {
          tickFormatter: (value: number) => (value >= 1000 ? `${value / 1000}k` : value.toString()),
        };
    }
  };

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 2, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  // Show message if no valid data
  if (!validData.length) {
    return (
      <Paper elevation={2} sx={{ p: 2, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ p: 2 }}
      data-testid="performance-chart"
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(dateStr) => {
              try {
                // Parse the already formatted date
                const date = parseISO(dateStr);
                return format(date, 'MMM d');
              } catch (e) {
                console.error('Date formatting error:', e);
                return '';
              }
            }}
            minTickGap={30}
          />
          
          {metrics.map((metric, idx) => (
            <YAxis 
              key={metric}
              yAxisId={metric}
              orientation={idx === 0 ? 'left' : 'right'}
              {...yAxisConfig(metric)}
            />
          ))}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={colorMap[metric]}
              yAxisId={metric}
              activeDot={{ r: 8 }}
              dot={{ r: 3 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default PerformanceChart;