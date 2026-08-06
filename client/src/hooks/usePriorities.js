/**
 * usePriorities Hook
 * District priorities board — public ranking + citizen vote.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const usePriorities = (district) => {
  const queryClient = useQueryClient();

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['priorities-ranking', district || 'all'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.PRIORITIES.RANKING, {
        params: district ? { district } : {},
      });
      return data;
    },
  });

  const submitVote = useMutation({
    mutationFn: async (voteData) => {
      const res = await axiosClient.post(API.PRIORITIES.VOTE, voteData);
      return res.data.vote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities-ranking'] });
      toast.success('Priority vote saved!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save vote'),
  });

  return { ranking, isLoading, submitVote };
};
