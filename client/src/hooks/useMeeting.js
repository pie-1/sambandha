/**
 * useMeeting Hook - For STEP 3 Collaboration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';
import toast from 'react-hot-toast';

export const useMeeting = (draftId) => {
  const queryClient = useQueryClient();

  // Get meeting link
  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', draftId],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.MEETINGS.GET(draftId));
      return data;
    },
    enabled: !!draftId,
  });

  // Create meeting
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
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create meeting');
    },
  });

  // Delete meeting
  const deleteMeeting = useMutation({
    mutationFn: async () => {
      const { data } = await axiosClient.delete(API.MEETINGS.DELETE(draftId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', draftId] });
      toast.success('Meeting ended');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    },
  });

  return {
    meeting,
    isLoading,
    createMeeting,
    deleteMeeting,
    hasMeeting: !!meeting?.meetingLink,
    meetingLink: meeting?.meetingLink,
  };
};