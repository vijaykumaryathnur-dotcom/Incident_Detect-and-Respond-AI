export interface P1ToastData {
  id: string;
  incidentId: string;
  incidentNumber: number;
  title: string;
  service: string;
  summary: string;
  timestamp: string;
  hindsightMatchesCount?: number;
  similarityScore?: number;
  likelyRootCause?: string;
  recommendedRunbook?: string;
  durationMs?: number;
  silent?: boolean;
}

export interface ToastContextType {
  toasts: P1ToastData[];
  soundEnabled: boolean;
  toggleSound: () => void;
  playAudioCue: () => void;
  triggerP1Alert: (customData?: Partial<P1ToastData>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}
