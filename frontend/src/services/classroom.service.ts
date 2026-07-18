import { apiClient } from "@/lib/api-client";
import {
  Classroom,
  CreateClassroomInput,
  JoinClassroomInput,
  TransferMonitorInput,
  UpdateClassroomInput,
} from "@/types/classroom";

export const classroomService = {
  async list(): Promise<Classroom[]> {
    const { data } = await apiClient.get<Classroom[]>("/classrooms");
    return data;
  },

  async getById(id: string): Promise<Classroom> {
    const { data } = await apiClient.get<Classroom>(`/classrooms/${id}`);
    return data;
  },

  async create(input: CreateClassroomInput): Promise<Classroom> {
    const { data } = await apiClient.post<Classroom>("/classrooms", input);
    return data;
  },

  async joinByCode(input: JoinClassroomInput): Promise<Classroom> {
    const { data } = await apiClient.post<Classroom>("/classrooms/join", input);
    return data;
  },

  async update(id: string, input: UpdateClassroomInput): Promise<Classroom> {
    const { data } = await apiClient.patch<Classroom>(`/classrooms/${id}`, input);
    return data;
  },

  async archive(id: string): Promise<Classroom> {
    const { data } = await apiClient.patch<Classroom>(`/classrooms/${id}/archive`);
    return data;
  },

  async unarchive(id: string): Promise<Classroom> {
    const { data } = await apiClient.patch<Classroom>(`/classrooms/${id}/unarchive`);
    return data;
  },

  async transferMonitor(id: string, input: TransferMonitorInput): Promise<Classroom> {
    const { data } = await apiClient.patch<Classroom>(
      `/classrooms/${id}/transfer-monitor`,
      input,
    );
    return data;
  },
};
