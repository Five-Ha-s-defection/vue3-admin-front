import request from "@/utils/request";

const PRODUCT_BASE_URL = "/api/app/product";

const ProductApi = {
  //获取商品列表
  getProductList(data: any) {
    console.log(data);
    return request({
      url: `${PRODUCT_BASE_URL}/product`,
      method: "get",
      params: data,
    });
  },
};
export default ProductApi;
