import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardHeader, Divider, IconButton, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Tooltip, List
} from '@mui/material';
import {
  Refresh, FilterList, Link, Warning, CheckCircle, Info,
  MoreVert, Search, Timeline, Flag, NotificationsActive
} from '@mui/icons-material';
import { getSocialMediaTips, getMarketActivity, linkTipToActivity, updateTipAnalysis } from '../../services/socialMediaMonitoringService';

const SocialMediaMonitoring = () => {
  const [socialMediaTips, setSocialMediaTips] = useState([]);
  const [marketActivity, setMarketActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    platform: '',
    analysisStatus: '',
    suspiciousScoreMin: 0,
    startDate: '',
    endDate: ''
  });
  const [selectedTip, setSelectedTip] = useState(null);
  const [openTipDialog, setOpenTipDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  useEffect(() => {
    fetchSocialMediaTips();
    fetchMarketActivity();
  }, []);
  
  const fetchSocialMediaTips = async () => {
    setLoading(true);
    try {
      const tips = await getSocialMediaTips(filters);
      setSocialMediaTips(tips);
    } catch (error) {
      console.error('Error fetching social media tips:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMarketActivity = async () => {
    try {
      const activity = await getMarketActivity();
      setMarketActivity(activity);
    } catch (error) {
      console.error('Error fetching market activity:', error);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = () => {
    fetchSocialMediaTips();
  };
  
  const resetFilters = () => {
    setFilters({
      platform: '',
      analysisStatus: '',
      suspiciousScoreMin: 0,
      startDate: '',
      endDate: ''
    });
  };
  
  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setOpenTipDialog(true);
  };
  
  const handleLinkToActivity = (tip) => {
    setSelectedTip(tip);
    setOpenLinkDialog(true);
  };
  
  const confirmLinkToActivity = async () => {
    if (!selectedTip || !selectedActivity) return;
    
    try {
      await linkTipToActivity(selectedTip.id, selectedActivity);
      fetchSocialMediaTips();
      fetchMarketActivity();
      setOpenLinkDialog(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error linking tip to activity:', error);
    }
  };
  
  const updateTipStatus = async (tipId, status, suspiciousScore) => {
    try {
      await updateTipAnalysis(tipId, {
        status,
        suspiciousScore,
        method: 'manual-review',
        notes: 'Updated by regulator',
        appendToHistory: true
      });
      fetchSocialMediaTips();
      setOpenTipDialog(false);
    } catch (error) {
      console.error('Error updating tip status:', error);
    }
  };
  
  const getSuspiciousScoreColor = (score) => {
    if (score >= 70) return '#f44336'; // High risk - red
    if (score >= 40) return '#ff9800'; // Medium risk - orange
    return '#4caf50'; // Low risk - green
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Social Media Monitoring Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Monitor social media platforms for suspicious stock tips and unusual market activity.
      </Typography>
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select
                name="platform"
                value={filters.platform}
                label="Platform"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Platforms</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
                <MenuItem value="reddit">Reddit</MenuItem>
                <MenuItem value="stocktwits">StockTwits</MenuItem>
                <MenuItem value="telegram">Telegram</MenuItem>
                <MenuItem value="discord">Discord</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Analysis Status</InputLabel>
              <Select
                name="analysisStatus"
                value={filters.analysisStatus}
                label="Analysis Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspicious">Suspicious</MenuItem>
                <MenuItem value="legitimate">Legitimate</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Min Suspicious Score"
              name="suspiciousScoreMin"
              type="number"
              value={filters.suspiciousScoreMin}
              onChange={handleFilterChange}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={resetFilters}
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              startIcon={<Search />}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Social Media Tips */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Monitored Social Media Tips
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchSocialMediaTips}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Content</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Suspicious Score</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {socialMediaTips.length > 0 ? (
                      socialMediaTips.map((tip) => (
                        <TableRow key={tip.id} hover onClick={() => handleTipClick(tip)}>
                          <TableCell>{tip.platform}</TableCell>
                          <TableCell>{tip.author}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tip.content}
                          </TableCell>
                          <TableCell>{tip.timestamp ? new Date(tip.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: tip.suspiciousScore ? getSuspiciousScoreColor(tip.suspiciousScore) : '#9e9e9e',
                                  color: 'white',
                                  mr: 1
                                }}
                              >
                                {tip.suspiciousScore || 'N/A'}
                              </Box>
                              {tip.suspiciousScore >= 70 && <Warning color="error" />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tip.analysisStatus || 'pending'}
                              color={
                                tip.analysisStatus === 'suspicious' ? 'error' :
                                tip.analysisStatus === 'legitimate' ? 'success' :
                                tip.analysisStatus === 'flagged' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Link to Market Activity">
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                handleLinkToActivity(tip);
                              }}>
                                <Link fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Info fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No social media tips found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Market Activity Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Unusual Market Activity
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchMarketActivity}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            
            {marketActivity.length > 0 ? (
              <List>
                {marketActivity.slice(0, 5).map((activity) => (
                  <Card key={activity.id} sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {activity.stock}
                        </Typography>
                        <Chip
                          label={activity.type}
                          color={
                            activity.type === 'price_spike' ? 'error' :
                            activity.type === 'volume_surge' ? 'warning' :
                            activity.type === 'unusual_options' ? 'info' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                        </Typography>
                        <Box>
                          <Tooltip title="View Timeline">
                            <IconButton size="small">
                              <Timeline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Flag for Review">
                            <IconButton size="small">
                              <Flag fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No unusual market activity detected
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* High Risk Summary */}
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              High Risk Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Suspicious Tips
              </Typography>
              <Typography variant="h4" color="error">
                {socialMediaTips.filter(tip => tip.suspiciousScore >= 70).length}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Linked to Market Activity
              </Typography>
              <Typography variant="h4" color="warning.main">
                {socialMediaTips.filter(tip => tip.linkedMarketActivity && tip.linkedMarketActivity.length > 0).length}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="error"
              startIcon={<NotificationsActive />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Generate Regulatory Alert
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tip Details Dialog */}
      <Dialog open={openTipDialog} onClose={() => setOpenTipDialog(false)} maxWidth="md" fullWidth>
        {selectedTip && (
          <>
            <DialogTitle>
              Social Media Tip Details
              <IconButton
                aria-label="close"
                onClick={() => setOpenTipDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <MoreVert />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Platform</Typography>
                  <Typography variant="body1" gutterBottom>{selectedTip.platform}</Typography>
                  
                  <Typography variant="subtitle2">Author</Typography>
                  <Typography variant="body1" gutterBottom>{selectedTip.author}</Typography>
                  
                  <Typography variant="subtitle2">Posted Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTip.timestamp ? new Date(selectedTip.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2">Content</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1">{selectedTip.content}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Suspicious Score</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: selectedTip.suspiciousScore ? getSuspiciousScoreColor(selectedTip.suspiciousScore) : '#9e9e9e',
                        color: 'white',
                        mr: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      {selectedTip.suspiciousScore || 'N/A'}
                    </Box>
                    <Typography>
                      {selectedTip.suspiciousScore >= 70 ? 'High Risk' :
                       selectedTip.suspiciousScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2">Current Status</Typography>
                  <Chip
                    label={selectedTip.analysisStatus || 'pending'}
                    color={
                      selectedTip.analysisStatus === 'suspicious' ? 'error' :
                      selectedTip.analysisStatus === 'legitimate' ? 'success' :
                      selectedTip.analysisStatus === 'flagged' ? 'warning' : 'default'
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2">Linked Market Activity</Typography>
                  {selectedTip.linkedMarketActivity && selectedTip.linkedMarketActivity.length > 0 ? (
                    selectedTip.linkedMarketActivity.map((activity, index) => (
                      <Chip
                        key={index}
                        label={`${activity.stockSymbol} - ${activity.activityType}`}
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No linked market activity
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2">Update Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'suspicious', selectedTip.suspiciousScore || 75)}
                    >
                      Mark Suspicious
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'legitimate', selectedTip.suspiciousScore || 20)}
                    >
                      Mark Legitimate
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'flagged', selectedTip.suspiciousScore || 50)}
                    >
                      Flag for Review
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenTipDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Link to Activity Dialog */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)}>
        <DialogTitle>Link to Market Activity</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Select market activity to link with this social media tip:
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Market Activity</InputLabel>
            <Select
              value={selectedActivity || ''}
              onChange={(e) => setSelectedActivity(e.target.value)}
              label="Market Activity"
            >
              {marketActivity.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.stock} - {activity.type} ({activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
          <Button onClick={confirmLinkToActivity} variant="contained" disabled={!selectedActivity}>
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialMediaMonitoring;