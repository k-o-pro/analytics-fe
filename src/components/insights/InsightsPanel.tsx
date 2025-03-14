import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    Chip,
    Divider,
    Alert,
    Button,
    IconButton,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton,
    alpha,
    useTheme
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    HelpOutline as HelpOutlineIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { gscService } from '../../services/gscService';
import { DateRange, Insights, InsightPerformance, InsightOpportunity, InsightIssue, InsightSuggestion } from '../../types/api';

interface InsightsPanelProps {
    siteUrl: string;
    dateRange: DateRange;
}

const severityColors = {
    high: 'error',
    medium: 'warning',
    low: 'info'
} as const;

const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'info'
} as const;

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const InsightSection: React.FC<SectionProps> = ({ title, icon, children }) => {
    const [expanded, setExpanded] = useState(true);
    const theme = useTheme();

    return (
        <Card 
            sx={{ 
                mb: 3,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8
                    }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {icon}
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                            {title}
                        </Typography>
                    </Box>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                <Collapse in={expanded}>
                    <Box sx={{ p: 0 }}>
                        {children}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

interface InsightItemProps<T> {
    item: T;
    renderContent: (item: T) => React.ReactNode;
}

function InsightItem<T>({ item, renderContent }: InsightItemProps<T>) {
    const [expanded, setExpanded] = useState(false);
    const [completed] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const theme = useTheme();

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    return (
        <>
            <ListItem 
                sx={{ 
                    p: 2,
                    transition: 'background-color 0.2s',
                    '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.05) 
                    },
                    opacity: completed ? 0.7 : 1,
                    textDecoration: completed ? 'line-through' : 'none',
                    cursor: 'pointer'
                }}
                onClick={handleToggle}
            >
                {renderContent(item)}
            </ListItem>
            
            <Dialog 
                open={helpOpen} 
                onClose={() => setHelpOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Why is this important?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        This insight helps you understand how to improve your search performance.
                        Following these recommendations can lead to better visibility and more traffic.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHelpOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ siteUrl, dateRange }) => {
    const theme = useTheme();
    const { data, isLoading, error } = useQuery(
        ['insights', siteUrl, dateRange],
        () => gscService.getInsights(siteUrl, dateRange),
        {
            enabled: !!siteUrl && !!dateRange.startDate && !!dateRange.endDate,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 2
        }
    );

    if (isLoading) {
        return (
            <Box>
                {[1, 2, 3].map((i) => (
                    <Card key={i} sx={{ mb: 3 }}>
                        <CardContent>
                            <Skeleton variant="text" width="40%" height={40} />
                            <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                    }
                }}
            >
                <Typography variant="subtitle1" fontWeight={500}>
                    Failed to load insights
                </Typography>
                <Typography variant="body2">
                    We couldn't load your insights at this time. Please try again later or contact support if the problem persists.
                </Typography>
                <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </Alert>
        );
    }

    const insights: Insights | undefined = data?.data;

    if (!insights || (!insights.performance.length && !insights.opportunities.length && !insights.issues.length && !insights.suggestions.length)) {
        return (
            <Box 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6)
                }}
            >
                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    No insights available yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    We don't have enough data to generate insights for this time period.
                    Try selecting a longer date range or check back later.
                </Typography>
                <Button variant="outlined" color="primary">
                    Learn more about insights
                </Button>
            </Box>
        );
    }

    const renderPerformanceItem = (item: InsightPerformance) => (
        <Box sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                    {item.severity === 'high' && <ErrorIcon color="error" fontSize="small" />}
                    {item.severity === 'medium' && <WarningIcon color="warning" fontSize="small" />}
                    {item.severity === 'low' && <InfoIcon color="info" fontSize="small" />}
                    <Typography variant="subtitle1">
                        {item.message}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={item.severity}
                        color={severityColors[item.severity]}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <IconButton size="small" aria-label="Mark as done" onClick={(e) => e.stopPropagation()}>
                        <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Learn more" onClick={(e) => e.stopPropagation()}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            {item.metrics && (
                <Box 
                    sx={{ 
                        mt: 1, 
                        p: 1, 
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Current: <strong>{item.metrics.current.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Target: <strong>{item.metrics.target.toFixed(2)}</strong>
                    </Typography>
                </Box>
            )}
        </Box>
    );

    const renderOpportunityItem = (item: InsightOpportunity) => (
        <Box sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1">
                    {item.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={item.priority}
                        color={priorityColors[item.priority]}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <IconButton size="small" aria-label="Mark as done" onClick={(e) => e.stopPropagation()}>
                        <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Learn more" onClick={(e) => e.stopPropagation()}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {item.description}
            </Typography>
            {item.potentialImprovement && (
                <Box 
                    sx={{ 
                        mt: 1, 
                        p: 1, 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 1,
                        display: 'inline-block' 
                    }}
                >
                    <Typography variant="body2" color="success.main" fontWeight={500}>
                        Potential improvement: {item.potentialImprovement}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Box>
            <InsightSection 
                title="Performance Analysis" 
                icon={<CheckCircleIcon color="success" />}
            >
                <List disablePadding>
                    {insights.performance.map((item, index) => (
                        <React.Fragment key={index}>
                            <InsightItem
                                item={item}
                                renderContent={renderPerformanceItem}
                            />
                            {index < insights.performance.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </InsightSection>

            <InsightSection 
                title="Opportunities" 
                icon={<InfoIcon color="primary" />}
            >
                <List disablePadding>
                    {insights.opportunities.map((item, index) => (
                        <React.Fragment key={index}>
                            <InsightItem
                                item={item}
                                renderContent={renderOpportunityItem}
                            />
                            {index < insights.opportunities.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </InsightSection>

            <InsightSection 
                title="Issues to Address" 
                icon={<ErrorIcon color="error" />}
            >
                <List disablePadding>
                    {insights.issues.map((item, index) => (
                        <React.Fragment key={index}>
                            <InsightItem
                                item={item}
                                renderContent={(item: InsightIssue) => (
                                    <Box sx={{ width: '100%' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography variant="subtitle1">
                                                {item.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label={item.severity}
                                                    color={severityColors[item.severity]}
                                                    size="small"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                                <IconButton size="small" aria-label="Mark as done" onClick={(e) => e.stopPropagation()}>
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" aria-label="Learn more" onClick={(e) => e.stopPropagation()}>
                                                    <HelpOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {item.description}
                                        </Typography>
                                        {item.impact && (
                                            <Box 
                                                sx={{ 
                                                    mt: 1, 
                                                    p: 1, 
                                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                    borderRadius: 1,
                                                    display: 'inline-block' 
                                                }}
                                            >
                                                <Typography variant="body2" color="warning.main" fontWeight={500}>
                                                    Impact: {item.impact}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            />
                            {index < insights.issues.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </InsightSection>

            <InsightSection 
                title="Actionable Suggestions" 
                icon={<InfoIcon color="info" />}
            >
                <List disablePadding>
                    {insights.suggestions.map((item, index) => (
                        <React.Fragment key={index}>
                            <InsightItem
                                item={item}
                                renderContent={(item: InsightSuggestion) => (
                                    <Box sx={{ width: '100%' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography variant="subtitle1">
                                                {item.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<CheckIcon />}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Apply
                                                </Button>
                                                <IconButton size="small" aria-label="Learn more" onClick={(e) => e.stopPropagation()}>
                                                    <HelpOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {item.description}
                                        </Typography>
                                        {item.implementation && (
                                            <Box 
                                                sx={{ 
                                                    mt: 1, 
                                                    p: 1, 
                                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                                    borderRadius: 1,
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {item.implementation}
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            />
                            {index < insights.suggestions.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </InsightSection>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Was this analysis helpful?
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button startIcon={<ThumbUpIcon />} size="small" variant="outlined" color="primary">
                    Yes, it was helpful
                </Button>
                <Button startIcon={<ThumbDownIcon />} size="small" variant="outlined" color="inherit">
                    No, needs improvement
                </Button>
            </Box>
        </Box>
    );
}; 