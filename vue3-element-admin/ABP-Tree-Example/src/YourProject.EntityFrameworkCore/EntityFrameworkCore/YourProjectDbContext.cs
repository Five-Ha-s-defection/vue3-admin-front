using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;
using YourProject.Categories;
using YourProject.Products;

namespace YourProject.EntityFrameworkCore;

public class YourProjectDbContext : AbpDbContext<YourProjectDbContext>
{
    public YourProjectDbContext(DbContextOptions<YourProjectDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureYourProject();
    }
}

public static class YourProjectDbContextModelCreatingExtensions
{
    public static void ConfigureYourProject(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        // Category 实体配置
        builder.Entity<Category>(b =>
        {
            b.ToTable(YourProjectConsts.DbTablePrefix + "Categories", YourProjectConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.CategoryName)
                .IsRequired()
                .HasMaxLength(100);

            b.Property(x => x.EnglishName)
                .HasMaxLength(100);

            b.Property(x => x.Description)
                .HasMaxLength(500);

            b.Property(x => x.Path)
                .HasMaxLength(1000);

            // 索引配置
            b.HasIndex(x => x.CategoryName);
            b.HasIndex(x => x.EnglishName);
            b.HasIndex(x => x.ParentId);
            b.HasIndex(x => x.Path);
            b.HasIndex(x => x.Level);

            // 自引用关系配置
            b.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // 与Product的关系配置
            b.HasMany(x => x.Products)
                .WithOne(x => x.Category)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Product 实体配置
        builder.Entity<Product>(b =>
        {
            b.ToTable(YourProjectConsts.DbTablePrefix + "Products", YourProjectConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.ProductCode)
                .IsRequired()
                .HasMaxLength(50);

            b.Property(x => x.ProductDescription)
                .HasMaxLength(500);

            b.Property(x => x.ProductImageUrl)
                .HasMaxLength(500);

            b.Property(x => x.ProductBrand)
                .HasMaxLength(100);

            b.Property(x => x.ProductSupplier)
                .HasMaxLength(100);

            b.Property(x => x.ProductRemark)
                .HasMaxLength(500);

            b.Property(x => x.SuggestedPrice)
                .HasPrecision(18, 2);

            b.Property(x => x.DealPrice)
                .HasPrecision(18, 2);

            // 索引配置
            b.HasIndex(x => x.ProductCode).IsUnique();
            b.HasIndex(x => x.CategoryId);
            b.HasIndex(x => x.ParentId);
            b.HasIndex(x => x.ProductStatus);
            b.HasIndex(x => x.ProductSupplier);
            b.HasIndex(x => x.ProductBrand);

            // 与Category的关系配置
            b.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
} 