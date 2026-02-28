using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;

namespace OracleWebApp.Models
{
    /// <summary>
    /// Entity Framework DbContext for Oracle Database.
    /// Column names use UPPER_CASE convention for Oracle compatibility.
    /// </summary>
    public class OracleDbContext : DbContext
    {
        public OracleDbContext()
            : base("name=OracleDbContext")
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Remove PluralizingTableNameConvention so table names match Oracle convention
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // -------------------------
            // Users table mapping
            // -------------------------
            modelBuilder.Entity<User>()
                .ToTable("USERS")
                .HasKey(u => u.UserId);

            modelBuilder.Entity<User>()
                .Property(u => u.UserId)
                .HasColumnName("USER_ID")
                .HasDatabaseGeneratedOption(
                    System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<User>()
                .Property(u => u.UserName)
                .HasColumnName("USER_NAME")
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasColumnName("EMAIL")
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<User>()
                .Property(u => u.FullName)
                .HasColumnName("FULL_NAME")
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasColumnName("CREATED_AT")
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .HasColumnName("UPDATED_AT")
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.IsDeleted)
                .HasColumnName("IS_DELETED")
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.RowVersion)
                .HasColumnName("ROW_VERSION")
                .IsRowVersion();

            // -------------------------
            // Products table mapping
            // -------------------------
            modelBuilder.Entity<Product>()
                .ToTable("PRODUCTS")
                .HasKey(p => p.ProductId);

            modelBuilder.Entity<Product>()
                .Property(p => p.ProductId)
                .HasColumnName("PRODUCT_ID")
                .HasDatabaseGeneratedOption(
                    System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Product>()
                .Property(p => p.ProductName)
                .HasColumnName("PRODUCT_NAME")
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Product>()
                .Property(p => p.Description)
                .HasColumnName("DESCRIPTION")
                .HasMaxLength(1000);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnName("PRICE")
                .IsRequired()
                .HasPrecision(15, 2);

            modelBuilder.Entity<Product>()
                .Property(p => p.Stock)
                .HasColumnName("STOCK")
                .IsRequired();

            modelBuilder.Entity<Product>()
                .Property(p => p.CreatedAt)
                .HasColumnName("CREATED_AT")
                .IsRequired();

            modelBuilder.Entity<Product>()
                .Property(p => p.UpdatedAt)
                .HasColumnName("UPDATED_AT")
                .IsRequired();

            modelBuilder.Entity<Product>()
                .Property(p => p.IsDeleted)
                .HasColumnName("IS_DELETED")
                .IsRequired();

            modelBuilder.Entity<Product>()
                .Property(p => p.RowVersion)
                .HasColumnName("ROW_VERSION")
                .IsRowVersion();
        }
    }
}
