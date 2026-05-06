export interface Category {
  categoryId: number;
  name: string;
  color: string;
  createdAt: Date;
}

export interface SubTask {
  subTaskId: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface Tag {
  tagId: number;
  name: string;
  color: string;
}

export interface Comment {
  commentId: number;
  taskId: number;
  content: string;
  createdAt: Date;
}

export interface Task {
  taskId: number;
  categoryId: number | null;
  title: string;
  description: string | null;
  priority: number;
  status: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  subTasks?: SubTask[];
  tags?: Tag[];
  comments?: Comment[];
}

export interface TaskRequestBody {
  categoryId?: number | null;
  title?: string;
  description?: string;
  priority?: number;
  status?: number;
  dueDate?: string | Date | null;
  CategoryId?: number | null;
  Title?: string;
  Description?: string;
  Priority?: number;
  Status?: number;
  DueDate?: string | Date | null;
}

export interface TaskListFilters {
  categoryId?: number;
  status?: number;
  priority?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
  includeRelated?: boolean;
}


export interface SubTaskFilters {
  taskId: number;
  includeRelated?: boolean;
}