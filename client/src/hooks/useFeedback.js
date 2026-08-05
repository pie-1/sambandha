/**
 * useFeedback Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useFeedback = (draftId) => {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['feedback-summary', draftId],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.FEEDBACK.SUMMARY(draftId));
      return data.summary;
    },
    enabled: !!draftId,
  });

  const submitFeedback = useMutation({
    mutationFn: async (feedbackData) => {
      const res = await axiosClient.post(API.FEEDBACK.SUBMIT(draftId), feedbackData);
      return res.data.feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-summary', draftId] });
      toast.success('Feedback submitted!');
    },
    onError: () => toast.error('Failed to submit feedback'),
  });

  return { summary, summaryLoading, submitFeedback };
};