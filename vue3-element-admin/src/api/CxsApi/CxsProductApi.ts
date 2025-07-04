import request from "@/utils/request";

const PRODUCT_BASE_URL = "/api/app/product";

const ProductApi = {
  //获取产品列表
  getProductList(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/product`,
      method: "get",
      params: data,
    });
  },

  //删除产品
  deleteProduct(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/${data.id}/d-product`,
      method: "delete",
    });
  },

  //修改产品
  updateProduct(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/${data.id}/product`,
      method: "put",
    });
  },
  /**
   * 产品修改状态
   */
  updProductState(id: string, state: boolean) {
    return request({
      url: `${PRODUCT_BASE_URL}/${id}/upd-product-state`,
      method: "put",
      params: { state },
    });
  },
  /**
   * 导出全部产品分类
   */
  exportAllProductCategoryTo() {
    return request({
      url: `${PRODUCT_BASE_URL}/export-all-product-category-to`,
      method: "get",
      responseType: "blob", // 导出文件必须加
    });
  },
};

export default ProductApi;
