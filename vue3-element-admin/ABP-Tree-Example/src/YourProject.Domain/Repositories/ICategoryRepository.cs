using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace YourProject.Categories
{
    /// <summary>
    /// 分类仓储接口
    /// </summary>
    public interface ICategoryRepository : IRepository<Category, Guid>
    {
        /// <summary>
        /// 获取树形结构
        /// </summary>
        Task<List<Category>> GetTreeAsync(bool includeProducts = false);

        /// <summary>
        /// 根据父级ID获取子分类
        /// </summary>
        Task<List<Category>> GetChildrenAsync(Guid? parentId, bool includeProducts = false);

        /// <summary>
        /// 获取所有子分类（递归）
        /// </summary>
        Task<List<Category>> GetAllChildrenAsync(Guid parentId, bool includeProducts = false);

        /// <summary>
        /// 获取所有父级分类（递归）
        /// </summary>
        Task<List<Category>> GetAllParentsAsync(Guid categoryId);

        /// <summary>
        /// 根据路径获取分类
        /// </summary>
        Task<Category> GetByPathAsync(string path, bool includeProducts = false);

        /// <summary>
        /// 检查是否存在子分类
        /// </summary>
        Task<bool> HasChildrenAsync(Guid categoryId);

        /// <summary>
        /// 获取分类及其所有子分类的产品数量
        /// </summary>
        Task<int> GetTotalProductCountAsync(Guid categoryId);

        /// <summary>
        /// 移动分类到新的父级
        /// </summary>
        Task MoveAsync(Guid categoryId, Guid? newParentId);

        /// <summary>
        /// 获取分类的完整路径名称
        /// </summary>
        Task<string> GetFullPathNameAsync(Guid categoryId);

        /// <summary>
        /// 批量更新分类路径
        /// </summary>
        Task UpdatePathsAsync();
    }
} 