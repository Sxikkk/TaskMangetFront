import { TaskStatus } from "../model/types";

// Assuming backend uses 0 for TODO, 1 for IN_PROGRESS, 2 for DONE
// Verify this assumption with the backend implementation if possible.

/**
 * Maps frontend TaskStatus enum (string) to backend status code (number).
 */
export const mapTaskStatusToBackend = (status: TaskStatus): number => {
  switch (status) {
    case TaskStatus.TODO: return 0;
    case TaskStatus.IN_PROGRESS: return 1;
    case TaskStatus.DONE: return 2;
    default: 
      console.warn(`Unknown TaskStatus to map to backend: ${status}`);
      return 0; // Default to TODO or handle as error
  }
};

/**
 * Maps backend status code (number) to frontend TaskStatus enum (string).
 */
export const mapTaskStatusFromBackend = (value: number | undefined | null): TaskStatus => {
    if (value === undefined || value === null) return TaskStatus.TODO; // Default if undefined
    switch (value) {
      case 0: return TaskStatus.TODO;
      case 1: return TaskStatus.IN_PROGRESS;
      case 2: return TaskStatus.DONE;
      default:
        console.warn(`Unknown backend status code to map to frontend: ${value}`);
        return TaskStatus.TODO; // Default to TODO or handle as error
    }
  }; 