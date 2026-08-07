/**
 * useParliament Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useParliament = () => {
  const queryClient = useQueryClient();

  // Get all topics
  const { data: topics = [], isLoading, refetch } = useQuery({
    queryKey: ['parliament-topics'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.PARLIAMENT.GET_ALL);
      return data.topics || [];
    },
  });

  // Get single topic
  const useTopic = (id) => {
    return useQuery({
      queryKey: ['parliament-topic', id],
      queryFn: async () => {
        const { data } = await axiosClient.get(API.PARLIAMENT.GET_ONE(id));
        return data.topic;
      },
      enabled: !!id,
    });
  };

  // ✅ Vote on topic - always 'approve'
  const voteOnTopic = useMutation({
    mutationFn: async ({ id }) => {
      const res = await axiosClient.post(API.PARLIAMENT.VOTE(id), { vote: 'approve' });
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parliament-topics'] });
      queryClient.invalidateQueries({ queryKey: ['parliament-topic', id] });
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
  });

  // Add expert opinion
  const addExpertOpinion = useMutation({
    mutationFn: async ({ id, opinion }) => {
      const res = await axiosClient.post(API.PARLIAMENT.EXPERT_OPINION(id), { opinion });
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parliament-topics'] });
      queryClient.invalidateQueries({ queryKey: ['parliament-topic', id] });
      toast.success('Expert opinion added!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add opinion');
    },
  });

  return {
    topics,
    isLoading,
    refetch,
    useTopic,
    voteOnTopic,
    addExpertOpinion,
  };
};