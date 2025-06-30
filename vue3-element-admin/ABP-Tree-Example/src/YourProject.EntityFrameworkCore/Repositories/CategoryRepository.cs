using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace YourProject.EntityFrameworkCore.Repositories
{
    /// <summary>
    /// 分类仓储实现
    /// </summary>
    public class CategoryRepository : EfCoreRepository<YourProjectDbContext, Category, Guid>, ICategoryRepository
    {
        public CategoryRepository(IDbContextProvider<YourProjectDbContext> dbContextProvider) 
            : base(dbContextProvider)
        {
        }

        /// <summary>
        /// 获取树形结构
        /// </summary>
        public async Task<List<Category>> GetTreeAsync(bool includeProducts = false)
        {
            var dbContext = await GetDbContextAsync();
            var query = dbContext.Categories.AsQueryable();

            if (includeProducts)
            {
                query = query.Include(x => x.Products);
            }

            var categories = await query
                .Include(x => x.Children)
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Sort)
                .ThenBy(x => x.CategoryName)
                .ToListAsync();

            return categories;
        }

        /// <summary>
        /// 根据父级ID获取子分类
        /// </summary>
        public async Task<List<Category>> GetChildrenAsync(Guid? parentId, bool includeProducts = false)
        {
            var dbContext = await GetDbContextAsync();
            var query = dbContext.Categories.AsQueryable();

            if (includeProducts)
            {
                query = query.Include(x => x.Products);
            }

            var categories = await query
                .Where(x => x.ParentId == parentId)
                .OrderBy(x => x.Sort)
                .ThenBy(x => x.CategoryName)
                .ToListAsync();

            return categories;
        }

        /// <summary>
        /// 获取所有子分类（递归）
        /// </summary>
        public async Task<List<Category>> GetAllChildrenAsync(Guid parentId, bool includeProducts = false)
        {
            var dbContext = await GetDbContextAsync();
            var query = dbContext.Categories.AsQueryable();

            if (includeProducts)
            {
                query = query.Include(x => x.Products);
            }

            // 使用递归CTE查询所有子分类
            var allChildren = await query
                .Where(x => x.Path.Contains(parentId.ToString()))
                .OrderBy(x => x.Level)
                .ThenBy(x => x.Sort)
                .ThenBy(x => x.CategoryName)
                .ToListAsync();

            return allChildren;
        }

        /// <summary>
        /// 获取所有父级分类（递归）
        /// </summary>
        public async Task<List<Category>> GetAllParentsAsync(Guid categoryId)
        {
            var dbContext = await GetDbContextAsync();
            var category = await dbContext.Categories
                .FirstOrDefaultAsync(x => x.Id == categoryId);

            if (category == null || string.IsNullOrEmpty(category.Path))
            {
                return new List<Category>();
            }

            var parentIds = category.Path.Split('/').Where(x => !string.IsNullOrEmpty(x)).Select(Guid.Parse);
            var parents = await dbContext.Categories
                .Where(x => parentIds.Contains(x.Id))
                .OrderBy(x => x.Level)
                .ToListAsync();

            return parents;
        }

        /// <summary>
        /// 根据路径获取分类
        /// </summary>
        public async Task<Category> GetByPathAsync(string path, bool includeProducts = false)
        {
            var dbContext = await GetDbContextAsync();
            var query = dbContext.Categories.AsQueryable();

            if (includeProducts)
            {
                query = query.Include(x => x.Products);
            }

            var category = await query
                .Include(x => x.Children)
                .FirstOrDefaultAsync(x => x.Path == path);

            return category;
        }

        /// <summary>
        /// 检查是否存在子分类
        /// </summary>
        public async Task<bool> HasChildrenAsync(Guid categoryId)
        {
            var dbContext = await GetDbContextAsync();
            return await dbContext.Categories.AnyAsync(x => x.ParentId == categoryId);
        }

        /// <summary>
        /// 获取分类及其所有子分类的产品数量
        /// </summary>
        public async Task<int> GetTotalProductCountAsync(Guid categoryId)
        {
            var dbContext = await GetDbContextAsync();
            
            // 获取所有子分类ID
            var childIds = await dbContext.Categories
                .Where(x => x.Path.Contains(categoryId.ToString()))
                .Select(x => x.Id)
                .ToListAsync();

            // 统计产品数量
            var productCount = await dbContext.Products
                .Where(x => childIds.Contains(x.CategoryId))
                .CountAsync();

            return productCount;
        }

        /// <summary>
        /// 移动分类到新的父级
        /// </summary>
        public async Task MoveAsync(Guid categoryId, Guid? newParentId)
        {
            var dbContext = await GetDbContextAsync();
            var category = await dbContext.Categories.FindAsync(categoryId);
            
            if (category == null)
            {
                throw new ArgumentException($"分类 {categoryId} 不存在");
            }

            // 检查是否形成循环引用
            if (newParentId.HasValue)
            {
                var newParent = await dbContext.Categories.FindAsync(newParentId.Value);
                if (newParent == null)
                {
                    throw new ArgumentException($"父级分类 {newParentId.Value} 不存在");
                }

                if (newParent.Path.Contains(categoryId.ToString()))
                {
                    throw new InvalidOperationException("不能将分类移动到其子分类下");
                }
            }

            // 更新父级ID
            category.ParentId = newParentId;

            // 更新层级和路径
            if (newParentId.HasValue)
            {
                var newParent = await dbContext.Categories.FindAsync(newParentId.Value);
                category.Level = newParent.Level + 1;
                category.Path = string.IsNullOrEmpty(newParent.Path) 
                    ? newParent.Id.ToString() 
                    : $"{newParent.Path}/{newParent.Id}";
            }
            else
            {
                category.Level = 0;
                category.Path = string.Empty;
            }

            // 更新所有子分类的路径
            await UpdateChildrenPathsAsync(category);

            await dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// 获取分类的完整路径名称
        /// </summary>
        public async Task<string> GetFullPathNameAsync(Guid categoryId)
        {
            var parents = await GetAllParentsAsync(categoryId);
            var category = await dbContext.Categories.FindAsync(categoryId);

            if (category == null)
            {
                return string.Empty;
            }

            var pathNames = parents.Select(x => x.CategoryName).ToList();
            pathNames.Add(category.CategoryName);

            return string.Join(" / ", pathNames);
        }

        /// <summary>
        /// 批量更新分类路径
        /// </summary>
        public async Task UpdatePathsAsync()
        {
            var dbContext = await GetDbContextAsync();
            
            // 获取所有根分类
            var rootCategories = await dbContext.Categories
                .Where(x => x.ParentId == null)
                .ToListAsync();

            foreach (var rootCategory in rootCategories)
            {
                await UpdateCategoryPathRecursiveAsync(rootCategory, string.Empty, 0);
            }

            await dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// 递归更新分类路径
        /// </summary>
        private async Task UpdateCategoryPathRecursiveAsync(Category category, string parentPath, int level)
        {
            var dbContext = await GetDbContextAsync();
            
            // 更新当前分类的路径和层级
            category.Path = string.IsNullOrEmpty(parentPath) ? category.Id.ToString() : $"{parentPath}/{category.Id}";
            category.Level = level;

            // 获取子分类
            var children = await dbContext.Categories
                .Where(x => x.ParentId == category.Id)
                .OrderBy(x => x.Sort)
                .ToListAsync();

            // 递归更新子分类
            foreach (var child in children)
            {
                await UpdateCategoryPathRecursiveAsync(child, category.Path, level + 1);
            }
        }

        /// <summary>
        /// 更新子分类路径
        /// </summary>
        private async Task UpdateChildrenPathsAsync(Category parentCategory)
        {
            var dbContext = await GetDbContextAsync();
            var children = await dbContext.Categories
                .Where(x => x.ParentId == parentCategory.Id)
                .ToListAsync();

            foreach (var child in children)
            {
                child.Level = parentCategory.Level + 1;
                child.Path = string.IsNullOrEmpty(parentCategory.Path) 
                    ? parentCategory.Id.ToString() 
                    : $"{parentCategory.Path}/{parentCategory.Id}";

                await UpdateChildrenPathsAsync(child);
            }
        }
    }
} 