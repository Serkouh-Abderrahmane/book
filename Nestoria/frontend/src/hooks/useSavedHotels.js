import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileAPI } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useSavedHotels() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const savedQ = useQuery({
    queryKey: ['saved'],
    queryFn:  () => profileAPI.getSaved(),
    enabled:  !!user,
    staleTime: 60 * 1000,
  });

  const ids = savedQ.data?.ids || [];

  const addMut = useMutation({
    mutationFn: (id) => profileAPI.addSaved(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['saved'] });
      const prev = qc.getQueryData(['saved']);
      qc.setQueryData(['saved'], (old) => ({
        ids: Array.from(new Set([...(old?.ids || []), id])),
        hotels: old?.hotels || [],
      }));
      return { prev };
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(['saved'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['saved'] }),
  });

  const removeMut = useMutation({
    mutationFn: (id) => profileAPI.removeSaved(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['saved'] });
      const prev = qc.getQueryData(['saved']);
      qc.setQueryData(['saved'], (old) => ({
        ids: (old?.ids || []).filter((x) => x !== id),
        hotels: (old?.hotels || []).filter((h) => h.id !== id),
      }));
      return { prev };
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(['saved'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['saved'] }),
  });

  const isSaved = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    if (!user) return;
    if (ids.includes(id)) removeMut.mutate(id);
    else addMut.mutate(id);
  }, [ids, user, addMut, removeMut]);

  return {
    saved:  savedQ.data?.hotels || [],
    ids,
    isSaved,
    toggle,
  };
}
