using AutoMapper;
using YourProject.Categories;
using YourProject.Products;

namespace YourProject;

public class YourProjectApplicationAutoMapperProfile : Profile
{
    public YourProjectApplicationAutoMapperProfile()
    {
        // Category 映射配置
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ChildrenCount, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.Ignore())
            .ForMember(dest => dest.Products, opt => opt.Ignore());

        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();

        // Product 映射配置
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.CategoryName));

        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();
    }
} 