using Microsoft.EntityFrameworkCore;

namespace DotNet_API.Data
{
    // This is the "Bridge" that connects your C# code to Supabase
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // We will add the tables (Users, Questions, etc.) here very soon!
    }
}