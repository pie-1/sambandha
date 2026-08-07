/**
 * useProjects Hook
 * Public transparency board — project ledger + aggregates.
 */

import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';

export const useProjects = (filters = {}) => {
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.PROJECTS.BASE, { params: filters });
      return data.projects || [];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['projects-stats'],
    queryFn: async () => {
      const { data } = await axiosClient.get(API.PROJECTS.STATS);
      return data;
    },
  });

  return { projects, stats, projectsLoading, statsLoading };
};
