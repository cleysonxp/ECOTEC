using EcoTec.Domain.Modelo;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcoTec.Infra.Banco;

public class EcoTecContext : DbContext
{
    public DbSet<Usuario> usuarios {  get; set; }

    private readonly string _connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EcoTec;Integrated Security=True;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder
                .UseSqlServer(_connectionString);
                //.UseLazyLoadingProxies();
        }
    }
}
