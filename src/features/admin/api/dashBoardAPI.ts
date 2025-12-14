import { api } from "@/lib/axios";
import type { DashboardRequestDTO } from "../types/index";

export const fetchUserChartData = async (from: Date, to: Date) => {
  const body: DashboardRequestDTO = {
    startDate: formatDate(from),
    endDate: formatDate(to),
  };

  try {
    const res = await api.post<any>("/posts/admin/dashboard/users", body);
    return res.data;
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    throw error;
  }
};

export const fetchPostChartData = async (from: Date, to: Date) => {
  const body: DashboardRequestDTO = {
    startDate: formatDate(from),
    endDate: formatDate(to),
  };

  try {
    const res = await api.post<any>("/posts/admin/dashboard/posts", body);
    return res.data;
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    throw error;
  }
};

export const fetchInteractChartData = async (from: Date, to: Date) => {
  const body: DashboardRequestDTO = {
    startDate: formatDate(from),
    endDate: formatDate(to),
  };

  try {
    const res = await api.post<any>(
      "/posts/admin/dashboard/interactions",
      body
    );
    return res.data;
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    throw error;
  }
};

export const fetchReportChartData = async (from: Date, to: Date) => {
  const body: DashboardRequestDTO = {
    startDate: formatDate(from),
    endDate: formatDate(to),
  };

  try {
    const res = await api.post<any>("/posts/admin/dashboard/reports", body);
    return res.data;
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    throw error;
  }
};

export const fetchDashboardCardData = async () => {
  try {
    const res = await api.get("/posts/admin/dashboard");
    return res.data;
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    throw error;
  }
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
