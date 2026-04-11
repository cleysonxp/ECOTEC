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
    public DbSet<Usuario> Usuarios {  get; set; }
    public DbSet<Endereco> Enderecos {  get; set; }
    
    public EcoTecContext() { }

    public EcoTecContext(DbContextOptions options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var connectionString = "server=localhost;port=3306;database=EcoTec;user=root;password=bcd127;SslMode=none;";

            optionsBuilder.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            );
        }
    }
}
