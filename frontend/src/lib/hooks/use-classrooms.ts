"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classroomsApi, type CreateClassroomPayload, type UpdateClassroomPayload } from "@/lib/api/classrooms";

export const CLASSROOMS_QUERY_KEY = ["classrooms"] as const;
export const classroomQueryKey = (id: string) => ["classrooms", id] as const;

export function useClassrooms() {
  return useQuery({
    queryKey: CLASSROOMS_QUERY_KEY,
    queryFn: classroomsApi.list,
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: classroomQueryKey(id),
    queryFn: () => classroomsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassroomPayload) =>
      classroomsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}

export function useJoinClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) => classroomsApi.join(joinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}

export function useUpdateClassroom(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClassroomPayload) =>
      classroomsApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(classroomQueryKey(id), data);
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}

export function useArchiveClassroom(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => classroomsApi.archive(id),
    onSuccess: (data) => {
      queryClient.setQueryData(classroomQueryKey(id), data);
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}

export function useUnarchiveClassroom(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => classroomsApi.unarchive(id),
    onSuccess: (data) => {
      queryClient.setQueryData(classroomQueryKey(id), data);
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}

export function useTransferMonitor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMonitorId: string) =>
      classroomsApi.transferMonitor(id, newMonitorId),
    onSuccess: (data) => {
      queryClient.setQueryData(classroomQueryKey(id), data);
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
    },
  });
}
