using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.ObjectMapping;

namespace YourProject.Categories
{
    /// <summary>
    /// 分类应用服务实现
    /// </summary>
    [Authorize]
    public class CategoryAppService : 
        CrudAppService<
            Category,
            CategoryDto,
            Guid,
            GetCategoryListDto,
            CreateCategoryDto,
            UpdateCategoryDto>,
        ICategoryAppService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IRepository<Product, Guid> _productRepository;

        public CategoryAppService(
            ICategoryRepository categoryRepository,
            IRepository<Product, Guid> productRepository) 
            : base(categoryRepository)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
        }

        /// <summary>
        /// 获取树形结构
        /// </summary>
        public async Task<List<CategoryDto>> GetTreeAsync(bool includeProducts = false)
        {
            var categories = await _categoryRepository.GetTreeAsync(includeProducts);
            return await BuildTreeAsync(categories, includeProducts);
        }

        /// <summary>
        /// 根据父级ID获取子分类
        /// </summary>
        public async Task<List<CategoryDto>> GetChildrenAsync(Guid? parentId, bool includeProducts = false)
        {
            var categories = await _categoryRepository.GetChildrenAsync(parentId, includeProducts);
            return await BuildTreeAsync(categories, includeProducts);
        }

        /// <summary>
        /// 获取所有子分类（递归）
        /// </summary>
        public async Task<List<CategoryDto>> GetAllChildrenAsync(Guid parentId, bool includeProducts = false)
        {
            var categories = await _categoryRepository.GetAllChildrenAsync(parentId, includeProducts);
            return ObjectMapper.Map<List<Category>, List<CategoryDto>>(categories);
        }

        /// <summary>
        /// 获取所有父级分类（递归）
        /// </summary>
        public async Task<List<CategoryDto>> GetAllParentsAsync(Guid categoryId)
        {
            var categories = await _categoryRepository.GetAllParentsAsync(categoryId);
            return ObjectMapper.Map<List<Category>, List<CategoryDto>>(categories);
        }

        /// <summary>
        /// 根据路径获取分类
        /// </summary>
        public async Task<CategoryDto> GetByPathAsync(string path, bool includeProducts = false)
        {
            var category = await _categoryRepository.GetByPathAsync(path, includeProducts);
            return ObjectMapper.Map<Category, CategoryDto>(category);
        }

        /// <summary>
        /// 检查是否存在子分类
        /// </summary>
        public async Task<bool> HasChildrenAsync(Guid categoryId)
        {
            return await _categoryRepository.HasChildrenAsync(categoryId);
        }

        /// <summary>
        /// 获取分类及其所有子分类的产品数量
        /// </summary>
        public async Task<int> GetTotalProductCountAsync(Guid categoryId)
        {
            return await _categoryRepository.GetTotalProductCountAsync(categoryId);
        }

        /// <summary>
        /// 移动分类到新的父级
        /// </summary>
        public async Task MoveAsync(Guid categoryId, Guid? newParentId)
        {
            await _categoryRepository.MoveAsync(categoryId, newParentId);
        }

        /// <summary>
        /// 获取分类的完整路径名称
        /// </summary>
        public async Task<string> GetFullPathNameAsync(Guid categoryId)
        {
            return await _categoryRepository.GetFullPathNameAsync(categoryId);
        }

        /// <summary>
        /// 批量更新分类路径
        /// </summary>
        public async Task UpdatePathsAsync()
        {
            await _categoryRepository.UpdatePathsAsync();
        }

        /// <summary>
        /// 获取分类选项（用于下拉选择）
        /// </summary>
        public async Task<List<CategoryOptionDto>> GetOptionsAsync()
        {
            var categories = await _categoryRepository.GetListAsync();
            var options = new List<CategoryOptionDto>();

            foreach (var category in categories)
            {
                var fullPathName = await GetFullPathNameAsync(category.Id);
                options.Add(new CategoryOptionDto
                {
                    Id = category.Id,
                    CategoryName = category.CategoryName,
                    EnglishName = category.EnglishName,
                    ParentId = category.ParentId,
                    Level = category.Level,
                    FullPathName = fullPathName
                });
            }

            return options.OrderBy(x => x.Level).ThenBy(x => x.FullPathName).ToList();
        }

        /// <summary>
        /// 重写创建方法，添加路径更新逻辑
        /// </summary>
        public override async Task<CategoryDto> CreateAsync(CreateCategoryDto input)
        {
            // 验证父级分类是否存在
            if (input.ParentId.HasValue)
            {
                var parent = await _categoryRepository.FindAsync(input.ParentId.Value);
                if (parent == null)
                {
                    throw new BusinessException("父级分类不存在");
                }
            }

            var category = ObjectMapper.Map<CreateCategoryDto, Category>(input);
            
            // 设置层级和路径
            if (input.ParentId.HasValue)
            {
                var parent = await _categoryRepository.FindAsync(input.ParentId.Value);
                category.Level = parent.Level + 1;
                category.Path = string.IsNullOrEmpty(parent.Path) 
                    ? parent.Id.ToString() 
                    : $"{parent.Path}/{parent.Id}";
            }
            else
            {
                category.Level = 0;
                category.Path = string.Empty;
            }

            await Repository.InsertAsync(category);
            return ObjectMapper.Map<Category, CategoryDto>(category);
        }

        /// <summary>
        /// 重写更新方法，添加路径更新逻辑
        /// </summary>
        public override async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryDto input)
        {
            var category = await Repository.FindAsync(id);
            if (category == null)
            {
                throw new BusinessException("分类不存在");
            }

            // 检查是否形成循环引用
            if (input.ParentId.HasValue && input.ParentId.Value != category.ParentId)
            {
                var newParent = await _categoryRepository.FindAsync(input.ParentId.Value);
                if (newParent == null)
                {
                    throw new BusinessException("父级分类不存在");
                }

                if (newParent.Path.Contains(id.ToString()))
                {
                    throw new BusinessException("不能将分类移动到其子分类下");
                }
            }

            ObjectMapper.Map(input, category);

            // 如果父级发生变化，更新路径
            if (input.ParentId != category.ParentId)
            {
                if (input.ParentId.HasValue)
                {
                    var newParent = await _categoryRepository.FindAsync(input.ParentId.Value);
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
            }

            await Repository.UpdateAsync(category);
            return ObjectMapper.Map<Category, CategoryDto>(category);
        }

        /// <summary>
        /// 重写删除方法，检查是否有子分类
        /// </summary>
        public override async Task DeleteAsync(Guid id)
        {
            var hasChildren = await _categoryRepository.HasChildrenAsync(id);
            if (hasChildren)
            {
                throw new BusinessException("该分类下还有子分类，无法删除");
            }

            var hasProducts = await _productRepository.AnyAsync(x => x.CategoryId == id);
            if (hasProducts)
            {
                throw new BusinessException("该分类下还有产品，无法删除");
            }

            await base.DeleteAsync(id);
        }

        /// <summary>
        /// 构建树形结构
        /// </summary>
        private async Task<List<CategoryDto>> BuildTreeAsync(List<Category> categories, bool includeProducts = false)
        {
            var categoryDtos = ObjectMapper.Map<List<Category>, List<CategoryDto>>(categories);

            foreach (var categoryDto in categoryDtos)
            {
                // 获取子分类数量
                categoryDto.ChildrenCount = await _categoryRepository.CountAsync(x => x.ParentId == categoryDto.Id);

                // 获取产品数量
                categoryDto.ProductCount = await _productRepository.CountAsync(x => x.CategoryId == categoryDto.Id);

                // 递归构建子分类
                if (categoryDto.ChildrenCount > 0)
                {
                    var children = await _categoryRepository.GetChildrenAsync(categoryDto.Id, includeProducts);
                    categoryDto.Children = await BuildTreeAsync(children, includeProducts);
                }

                // 获取产品列表
                if (includeProducts)
                {
                    var products = await _productRepository.GetListAsync(x => x.CategoryId == categoryDto.Id);
                    categoryDto.Products = ObjectMapper.Map<List<Product>, List<ProductDto>>(products);
                }
            }

            return categoryDtos;
        }

        /// <summary>
        /// 更新子分类路径
        /// </summary>
        private async Task UpdateChildrenPathsAsync(Category parentCategory)
        {
            var children = await _categoryRepository.GetChildrenAsync(parentCategory.Id);
            foreach (var child in children)
            {
                child.Level = parentCategory.Level + 1;
                child.Path = string.IsNullOrEmpty(parentCategory.Path) 
                    ? parentCategory.Id.ToString() 
                    : $"{parentCategory.Path}/{parentCategory.Id}";

                await Repository.UpdateAsync(child);
                await UpdateChildrenPathsAsync(child);
            }
        }
    }
} 