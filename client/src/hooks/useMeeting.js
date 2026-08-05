/**
 * useMeeting Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useMeeting = (draftId) => {
  const queryClient = useQueryClient();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', draftId],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.MEETINGS.GET(draftId));
      return data;
    },
    enabled: !!draftId,
  });

  const createMeeting = useMutation({
    mutationFn: async () => {
      const { data } = await axiosClient.post(API.MEETINGS.CREATE(draftId));
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meeting', draftId] });
      toast.success('Meeting created!');
      if (data.meetingLink) {
        window.open(data.meetingLink, '_blank');
      }
    },
    onError: () => toast.error('Failed to create meeting'),
  });

  return {
    meeting,
    isLoading,
    createMeeting,
    hasMeeting: !!meeting?.meetingLink,
    meetingLink: meeting?.meetingLink,
  };
};