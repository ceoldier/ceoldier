export type MediaKind = "image" | "video";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Generation {
  id: string;
  kind: MediaKind;
  prompt: string;
  status: JobStatus;
  url?: string;
  error?: string;
  createdAt: number;
}

export interface SavedPrompt {
  id: string;
  text: string;
  createdAt: number;
}
