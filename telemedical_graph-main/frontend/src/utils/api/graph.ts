import { endpoints } from './config';
import { api } from './client';

export interface GraphDoctorDiscovery {
  doctorId: number;
  name: string;
  specialization: string;
}

export interface PatientJourneyItem {
  appointmentId: number;
  appointmentDate: string;
  status: string;
  mode: string;
  doctorId: number;
  doctorName: string;
  consulted: boolean;
}

export interface GraphReferral {
  fromDoctorId: number;
  fromDoctorName: string;
  toDoctorId: number;
  toDoctorName: string;
  reason: string | null;
  referredOn: string | null;
  synthetic: boolean;
}

export interface GraphReferralPath {
  steps: GraphReferral[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
}

export interface GraphRelationship {
  id: string;
  type: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface GraphPatientRequest {
  firstName: string;
  lastName: string;
  dob: string;
  gender?: string;
  city: string;
  area?: string;
  pincode?: string;
}

export type GraphCrudType = 'doctors' | 'hospitals' | 'consultations' | 'prescriptions' | 'medicines' | 'tests';

const query = (values: Record<string, string | number | undefined>): string => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
};

export const graphApi = {
  discoverDoctors: (specialization: string, excludeDoctorId?: string) =>
    api.get<GraphDoctorDiscovery[]>(`${endpoints.graph.doctors}?${query({ specialization, excludeDoctorId })}`),
  patientJourney: (patientId: string) => api.get<PatientJourneyItem[]>(endpoints.graph.patientJourney(patientId)),
  referrals: (doctorId: string) => api.get<GraphReferral[]>(endpoints.graph.referrals(doctorId)),
  referralPaths: (fromDoctorId: string, toDoctorId: string, maxDepth = 3) =>
    api.get<GraphReferralPath[]>(`${endpoints.graph.referralPath}?${query({ fromDoctorId, toDoctorId, maxDepth })}`),
  patientVisualization: (patientId: string) =>
    api.get<GraphData>(`${endpoints.graph.visualization}?${query({ patientId, maxNodes: 24 })}`),
  doctorVisualization: (doctorId: string) =>
    api.get<GraphData>(`${endpoints.graph.visualization}?${query({ doctorId, maxNodes: 24 })}`),
  patientNode: (patientId: string) => api.get<GraphNode>(`/graph/patients/${encodeURIComponent(patientId)}`),
  createPatientNode: (body: GraphPatientRequest) => api.post<GraphNode>('/graph/patients', body),
  updatePatientNode: (patientId: string, body: GraphPatientRequest) => api.put<GraphNode>(`/graph/patients/${encodeURIComponent(patientId)}`, body),
  deletePatientNode: (patientId: string) => api.delete<void>(`/graph/patients/${encodeURIComponent(patientId)}`),
  refreshFromOracle: () => api.post<{ status: string; nodeCount: number; database: string }>('/graph/sync', {}),
  crud: {
    list: <T,>(type: GraphCrudType) => api.get<T[]>(`/graph/crud/${type}`),
    read: <T,>(type: GraphCrudType, id: string) => api.get<T>(`/graph/crud/${type}/${encodeURIComponent(id)}`),
    create: <T,>(type: GraphCrudType, body: unknown) => api.post<T>(`/graph/crud/${type}`, body),
    update: <T,>(type: GraphCrudType, id: string, body: unknown) => api.put<T>(`/graph/crud/${type}/${encodeURIComponent(id)}`, body),
    delete: (type: GraphCrudType, id: string) => api.delete<void>(`/graph/crud/${type}/${encodeURIComponent(id)}`)
  }
};
