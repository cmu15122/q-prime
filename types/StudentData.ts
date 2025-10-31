/**
 * Type of a student's own entry on the queue
 */
export type StudentData = {
  name: string;
  andrewID: string;
  location: string;
  topic: {
    assignment_id: number;
    name: string;
  };
  question: string;
  isFrozen: boolean;
  taMessage: string;
  taMessageBuffer: string[];
  status: number;
  position: number;
  helpingTAInfo?: {
    taId: number;
    taAndrewID: string;
    taPrefName: string;
    taZoomEnabled: boolean;
    taZoomUrl: string;
    helpStartTime: Date;
  };
};
