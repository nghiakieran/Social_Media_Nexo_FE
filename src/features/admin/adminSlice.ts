import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchReportsByType,
  updateUserReportStatus,
  GetReportsParams,
} from "./api/reportManagementAPI";

export type ReportType = "post" | "reel" | "user";

export interface UserReport {
  reporterId: number;
  reporterUsername: string;
  reportedId: number;
  reportedUsername: string;
  reason: string;
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";
  createdAt: string;
}

export interface PostReelReport {
  id: number;
  reporterName: string;
  ownerPostName: string;
  reason: string;
  reportStatus: string;
  createdAt: string;
}

interface ReportsState {
  // Reports data
  reports: (UserReport | PostReelReport)[];
  
  // Filters and pagination
  activeTab: ReportType;
  statusFilter: "ALL" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  currentPage: number;
  totalPages: number;
  totalElements: number;
  
  // Statistics
  totalPending: number;
  totalProcessing: number;
  totalApproved: number;
  totalRejected: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedReport: UserReport | PostReelReport | null;
  
  // Search
  search: string;
}

const initialState: ReportsState = {
  reports: [],
  activeTab: "post",
  statusFilter: "ALL",
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  totalPending: 0,
  totalProcessing: 0,
  totalApproved: 0,
  totalRejected: 0,
  isLoading: false,
  error: null,
  selectedReport: null,
  search: "",
};

// Async thunks
export const fetchReportsAsync = createAsyncThunk(
  "admin/fetchReports",
  async (
    params: {
      type: ReportType;
      pageNo: number;
      pageSize: number;
      status?: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
      keyword?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiStatus =
        params.status === "ALL" ? undefined : params.status;
      const data = await fetchReportsByType(params.type, {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        status: apiStatus,
        keyword: params.keyword,
      });
      return { type: params.type, data };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError?.response?.data?.message ||
        "Không thể tải danh sách báo cáo";
      return rejectWithValue(message);
    }
  }
);

export const updateUserReportStatusAsync = createAsyncThunk(
  "admin/updateUserReportStatus",
  async (
    params: {
      reporterId: number;
      reportedId: number;
      status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";
    },
    { rejectWithValue }
  ) => {
    try {
      await updateUserReportStatus(
        params.reporterId,
        params.reportedId,
        params.status
      );
      return params;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError?.response?.data?.message ||
        "Không thể cập nhật trạng thái báo cáo";
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ReportType>) => {
      state.activeTab = action.payload;
      state.currentPage = 0; // Reset page when changing tab
    },
    setStatusFilter: (
      state,
      action: PayloadAction<"ALL" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED">
    ) => {
      state.statusFilter = action.payload;
      state.currentPage = 0; // Reset page when changing filter
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 0; // Reset page when searching
    },
    setSelectedReport: (
      state,
      action: PayloadAction<UserReport | PostReelReport | null>
    ) => {
      state.selectedReport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch reports
    builder
      .addCase(fetchReportsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { type, data } = action.payload;

        if (type === "user") {
          // User reports format
          const reports = data.content || [];
          state.reports = reports;
          state.totalPages = data.totalPages || 0;
          state.totalElements = data.totalElements || 0;
          state.totalPending = reports.filter(
            (r: UserReport) => r.status === "PENDING"
          ).length;
          state.totalProcessing = reports.filter(
            (r: UserReport) => r.status === "IN_REVIEW"
          ).length;
          state.totalApproved = reports.filter(
            (r: UserReport) => r.status === "APPROVED"
          ).length;
          state.totalRejected = reports.filter(
            (r: UserReport) => r.status === "REJECTED"
          ).length;
        } else {
          // Post/Reel reports format
          state.reports = data.reportSummaries?.content || [];
          state.totalPages = data.totalPages || 0;
          state.totalElements =
            data.pendingQuantity +
            data.processingQuantity +
            data.approvedQuantity +
            data.rejectQuantity || 0;
          state.totalPending = data.pendingQuantity || 0;
          state.totalProcessing = data.processingQuantity || 0;
          state.totalApproved = data.approvedQuantity || 0;
          state.totalRejected = data.rejectQuantity || 0;
        }
      })
      .addCase(fetchReportsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user report status
    builder
      .addCase(updateUserReportStatusAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserReportStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reporterId, reportedId, status } = action.payload;
        
        // Update the report in the list if it exists
        const reportIndex = state.reports.findIndex(
          (r) =>
            "reporterId" in r &&
            r.reporterId === reporterId &&
            r.reportedId === reportedId
        );
        
        if (reportIndex !== -1) {
          const report = state.reports[reportIndex] as UserReport;
          state.reports[reportIndex] = { ...report, status };
          
          // Update selected report if it's the same one
          if (
            state.selectedReport &&
            "reporterId" in state.selectedReport &&
            state.selectedReport.reporterId === reporterId &&
            state.selectedReport.reportedId === reportedId
          ) {
            state.selectedReport = { ...state.selectedReport, status };
          }
        }
      })
      .addCase(updateUserReportStatusAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveTab,
  setStatusFilter,
  setCurrentPage,
  setSearch,
  setSelectedReport,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;


