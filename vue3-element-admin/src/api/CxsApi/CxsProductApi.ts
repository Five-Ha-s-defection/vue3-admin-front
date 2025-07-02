import request from "@/utils/request";

const PRODUCT_BASE_URL = "/api/app/product";

const ProductApi = {
  //获取产品列表
  getProductList(data: any) {
    console.log(data);
    return request({
      url: `${PRODUCT_BASE_URL}/product`,
      method: "get",
      params: data,
    });
  },

//删除产品
deleteProduct(data:any){
  return request({
    url: `${PRODUCT_BASE_URL}/product/${data.DeleteId}`,
      method: "delete",
    });
  },

  //删除多个产品
  deleteManyProducts(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/many-product`,
      method: "delete",
    });
  },

  //查询产品详情
  getProductDetail(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/product/${data.GetId}`,
      method: "get",
    });
  },

  //修改产品
  updateProduct(data: any) {
    return request({
      url: `${PRODUCT_BASE_URL}/${data.id}/product`,
      method: "put",
    });
  },
};
export default ProductApi;
