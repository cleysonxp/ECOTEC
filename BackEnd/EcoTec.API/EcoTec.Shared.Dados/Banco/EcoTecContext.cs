using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcoTec.Shared.Dados.Banco;

internal class EcoTecContext: DbContext
{
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
