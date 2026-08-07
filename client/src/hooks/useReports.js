/**
 * useReports Hook 
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useReports = () => {
  const queryClient = useQueryClient();

  // Get all reports
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.REPORTS.BASE);
      return data.reports || [];
    },
  });

  // Get report stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.REPORTS.STATS);
      return data.stats || [];
    },
  });

  // Get One Health summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['one-health-summary'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.REPORTS.ONE_HEALTH_SUMMARY);
      return data.summary;
    },
  });

  // Get top districts
  const { data: topDistricts } = useQuery({
    queryKey: ['top-districts'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.REPORTS.TOP_DISTRICTS);
      return data.districts || [];
    },
  });

  // Create report with images
  const createReport = useMutation({
    mutationFn: async (reportData) => {
      const res = await axiosClient.post(API.REPORTS.CREATE, reportData);
      return res.data.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      queryClient.invalidateQueries({ queryKey: ['one-health-summary'] });
      queryClient.invalidateQueries({ queryKey: ['top-districts'] });
      toast.success('Report submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    },
  });

  // Get reports by district
  const useReportsByDistrict = (district) => {
    return useQuery({
      queryKey: ['reports', 'district', district],
      queryFn: async () => {
        const { data } = await axiosClient.get(API.REPORTS.BY_DISTRICT(district));
        return data.reports || [];
      },
      enabled: !!district,
    });
  };

  // Get single report
  const useReport = (id) => {
    return useQuery({
      queryKey: ['report', id],
      queryFn: async () => {
        const { data } = await axiosClient.get(API.REPORTS.GET_ONE(id));
        return data.report;
      },
      enabled: !!id,
    });
  };

  return {
    reports,
    isLoading,
    refetch,
    stats,
    statsLoading,
    summary,
    summaryLoading,
    topDistricts,
    createReport,
    useReportsByDistrict,
    useReport,
  };
};



// designed to manage citizen reports by fetching report data , creating new reports, retrieving statistics
// and summeries 