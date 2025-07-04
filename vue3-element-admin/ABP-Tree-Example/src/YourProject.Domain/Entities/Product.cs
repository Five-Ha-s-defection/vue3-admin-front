using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace YourProject.Products
{
    /// <summary>
    /// 产品实体
    /// </summary>
    public class Product : AuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 产品分类
        /// </summary>
        public Guid CategoryId { get; set; } = Guid.Empty;

        /// <summary>
        /// 父级分类ID (可为空，顶级分类没有父级)
        /// </summary>
        public Guid ParentId { get; set; } = Guid.Empty;

        /// <summary>
        /// 产品图片
        /// </summary>
        public string ProductImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// 门幅
        /// </summary>
        public string ProductBrand { get; set; } = string.Empty;

        /// <summary>
        /// 供应商
        /// </summary>
        public string ProductSupplier { get; set; } = string.Empty;

        /// <summary>
        /// 产品编号
        /// </summary>
        public string ProductCode { get; set; } = string.Empty;

        /// <summary>
        /// 产品描述
        /// </summary>
        public string ProductDescription { get; set; } = string.Empty;

        /// <summary>
        /// 建议售价
        /// </summary>
        public decimal? SuggestedPrice { get; set; } = 0;

        /// <summary>
        /// 备注
        /// </summary>
        public string ProductRemark { get; set; } = string.Empty;

        /// <summary>
        /// 上架未上架
        /// </summary>
        public bool ProductStatus { get; set; } = false;

        /// <summary>
        /// 成交价
        /// </summary>
        public decimal? DealPrice { get; set; } = 0;

        /// <summary>
        /// 关联的分类
        /// </summary>
        public virtual Category Category { get; set; }

        public Product()
        {
            ProductStatus = false;
            SuggestedPrice = 0;
            DealPrice = 0;
        }

        public Product(string productCode, Guid categoryId, string productDescription = "")
        {
            ProductCode = productCode;
            CategoryId = categoryId;
            ProductDescription = productDescription;
            ProductStatus = false;
            SuggestedPrice = 0;
            DealPrice = 0;
        }
    }
} 