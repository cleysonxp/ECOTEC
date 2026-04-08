using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.Infra.Banco;

internal class EcoTecContext: DbContext
{
    public DbSet<Usuario> Usuarios { get; set; }

    private readonly string _connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EcoTecV0;Integrated Security=True;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    //private string connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EcoTec;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder
                .UseSqlServer(_connectionString)
                .UseLazyLoadingProxies();
        }
    }
}
