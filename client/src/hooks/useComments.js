/**
 * useComments Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useComments = (draftId) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['comments', draftId],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.COMMENTS.GET_ALL(draftId));
      return data.comments || [];
    },
    enabled: !!draftId,
  });

  const addComment = useMutation({
    mutationFn: async (commentData) => {
      const res = await axiosClient.post(API.COMMENTS.CREATE(draftId), commentData);
      return res.data.comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', draftId] });
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  return { comments, isLoading, refetch, addComment };
};