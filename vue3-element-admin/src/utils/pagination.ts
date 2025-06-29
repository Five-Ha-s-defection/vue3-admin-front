/**
 * 分页工具函数
 */

/**
 * 分页查询参数接口
 */
export interface PaginationQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

/**
 * 分页响应数据接口
 */
export interface PaginationResult<T = any> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 创建默认分页查询参数
 */
export function createPaginationQuery(pageNum = 1, pageSize = 10): PaginationQuery {
  return {
    pageNum,
    pageSize,
  };
}

/**
 * 计算分页信息
 */
export function calculatePagination(total: number, pageSize: number, currentPage: number) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    currentPage,
    pageSize,
    total,
  };
}

/**
 * 格式化分页数据
 */
export function formatPaginationData<T>(data: any): PaginationResult<T> {
  // 兼容不同的后端返回格式
  if (data.list && typeof data.total === "number") {
    return {
      list: data.list,
      total: data.total,
      pageNum: data.pageNum || 1,
      pageSize: data.pageSize || 10,
    };
  }

  // 兼容 records 字段
  if (data.records && typeof data.total === "number") {
    return {
      list: data.records,
      total: data.total,
      pageNum: data.current || 1,
      pageSize: data.size || 10,
    };
  }

  // 兼容 data 字段
  if (data.data && typeof data.total === "number") {
    return {
      list: data.data,
      total: data.total,
      pageNum: data.pageNum || 1,
      pageSize: data.pageSize || 10,
    };
  }

  // 如果都不是，返回原始数据
  return {
    list: Array.isArray(data) ? data : [],
    total: 0,
    pageNum: 1,
    pageSize: 10,
  };
}

/**
 * 验证分页参数
 */
export function validatePaginationParams(pageNum: number, pageSize: number): boolean {
  return pageNum > 0 && pageSize > 0 && pageSize <= 1000;
}

/**
 * 获取分页显示文本
 */
export function getPaginationText(total: number, pageSize: number, currentPage: number): string {
  const { startIndex, endIndex } = calculatePagination(total, pageSize, currentPage);
  return `共 ${total} 条记录，显示第 ${startIndex}-${endIndex} 条`;
}

/**
 * 分页配置选项
 */
export const PAGINATION_OPTIONS = {
  // 默认每页条数选项
  PAGE_SIZES: [10, 20, 30, 50, 100],

  // 默认布局
  DEFAULT_LAYOUT: "total, sizes, prev, pager, next, jumper",

  // 简化布局（移动端）
  SIMPLE_LAYOUT: "prev, pager, next",

  // 默认每页条数
  DEFAULT_PAGE_SIZE: 20,

  // 最大每页条数
  MAX_PAGE_SIZE: 1000,
} as const;
