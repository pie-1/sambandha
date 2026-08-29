import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useDrafts = (filters = {}) => {
  const queryClient = useQueryClient();  
  const { data: drafts = [], isLoading, refetch } = useQuery({
    queryKey: ['drafts', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.DRAFTS.GET_ALL, { params: filters });
      return data.drafts || [];
    },
  });  
  const useDraft = (id) => {
    return useQuery({
      queryKey: ['draft', id],
      queryFn: async () => {
        const { data } = await axiosClient.get(API.DRAFTS.GET_ONE(id));
        return data.draft;
      },
      enabled: !!id,
    });
  };
  
  const createDraft = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post(API.DRAFTS.CREATE, data);
      return res.data.draft;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create draft');
    },
  });  
  const updateDraft = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosClient.patch(API.DRAFTS.UPDATE(id), data);
      return res.data.draft;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      toast.success('Draft updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update draft');
    },
  });  
  const finalizeDraft = useMutation({
    mutationFn: async (id) => {
      const res = await axiosClient.patch(API.DRAFTS.FINALIZE(id));
      return res.data.draft;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      toast.success('Draft finalized successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to finalize draft');
    },
  });  
  const updateConsensus = useMutation({
    mutationFn: async ({ id, approved, comment }) => {
      const res = await axiosClient.patch(API.DRAFTS.CONSENSUS(id), { approved, comment });
      return res.data.consensus;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      toast.success('Consensus updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update consensus');
    },
  });
  const updateImplementation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosClient.patch(API.DRAFTS.IMPLEMENTATION(id), data);
      return res.data.implementationStatus;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      toast.success('Implementation updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update implementation');
    },
  });
  const useOneHealthDashboard = () => {
    return useQuery({
      queryKey: ['one-health-dashboard'],
      queryFn: async () => {
        const { data } = await axiosClient.get(API.DRAFTS.DASHBOARD);
        return data.dashboard || {};
      },
      retry: 1,
    });
  };

  return {
    drafts,
    isLoading,
    refetch,
    useDraft,
    createDraft,
    updateDraft,
    finalizeDraft,
    updateConsensus,
    updateImplementation,
    useOneHealthDashboard, 
  };
};