"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { classroomService } from "@/services/classroom.service";
import {
  CreateClassroomInput,
  JoinClassroomInput,
  TransferMonitorInput,
  UpdateClassroomInput,
} from "@/types/classroom";

export const classroomKeys = {
  all: ["classrooms"] as const,
  lists: () => [...classroomKeys.all, "list"] as const,
  detail: (id: string) => [...classroomKeys.all, "detail", id] as const,
};

export function useClassrooms() {
  return useQuery({
    queryKey: classroomKeys.lists(),
    queryFn: classroomService.list,
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: classroomKeys.detail(id),
    queryFn: () => classroomService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateClassroomInput) => classroomService.create(input),
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
      router.push(`/classroom/${classroom.id}`);
    },
  });
}

export function useJoinClassroom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: JoinClassroomInput) => classroomService.joinByCode(input),
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
      router.push(`/classroom/${classroom.id}`);
    },
  });
}

export function useUpdateClassroom(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClassroomInput) => classroomService.update(id, input),
    onSuccess: (classroom) => {
      queryClient.setQueryData(classroomKeys.detail(id), classroom);
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
    },
  });
}

export function useArchiveClassroom(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => classroomService.archive(id),
    onSuccess: (classroom) => {
      queryClient.setQueryData(classroomKeys.detail(id), classroom);
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
    },
  });
}

export function useUnarchiveClassroom(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => classroomService.unarchive(id),
    onSuccess: (classroom) => {
      queryClient.setQueryData(classroomKeys.detail(id), classroom);
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
    },
  });
}

export function useTransferMonitor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferMonitorInput) =>
      classroomService.transferMonitor(id, input),
    onSuccess: (classroom) => {
      queryClient.setQueryData(classroomKeys.detail(id), classroom);
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
    },
  });
}
