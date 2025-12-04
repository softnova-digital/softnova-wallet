export type CategoryType = "EXPENSE" | "INCOME";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    expenses?: number;
    incomes?: number;
  };
}

// Keep IncomeCategory for backward compatibility, but it's now just an alias
export type IncomeCategory = Category;

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  description: string | null; // Description is now optional
  date: Date;
  payee: string;
  categoryId: string;
  category?: Category;
  labels?: { label: Label }[];
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  date: Date;
  source: string;
  categoryId: string;
  category?: Category; // Now uses unified Category
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  categoryId?: string | null;
  category?: Category | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  amount: number;
  description?: string; // Description is now optional
  date: Date;
  payee: string;
  categoryId: string;
  labelIds: string[];
  receiptUrl?: string;
  receiptPublicId?: string;
}

export interface IncomeFormData {
  amount: number;
  description: string;
  date: Date;
  source: string;
  categoryId: string;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

// Keep for backward compatibility
export interface IncomeCategoryFormData {
  name: string;
  icon: string;
  color: string;
}

export interface BudgetFormData {
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  categoryId?: string;
}
