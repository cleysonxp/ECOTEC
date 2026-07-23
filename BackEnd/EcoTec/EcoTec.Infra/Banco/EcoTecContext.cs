using EcoTec.Domain.Modelo;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.Infra.Banco;

public class EcoTecContext : DbContext
{
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Endereco> Enderecos { get; set; }
    public DbSet<Denuncia> Denuncias { get; set; }
    public DbSet<DenunciaLike> DenunciasLike { get; set; }
    public DbSet<TipoDenuncia> TiposDenuncia { get; set; }
    public DbSet<EnderecoDenuncia> EnderecosDenuncia { get; set; }

    public EcoTecContext() { }

    public EcoTecContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Chave composta da tabela de likes
        modelBuilder.Entity<DenunciaLike>()
            .HasKey(dl => new { dl.IdUsuario, dl.IdDenuncia });

        // Seed dos tipos de denúncia
        modelBuilder.Entity<TipoDenuncia>().HasData(
            new TipoDenuncia { IdTipoDenuncia = 1, Descricao = "Desmatamento e queimadas" },
            new TipoDenuncia { IdTipoDenuncia = 2, Descricao = "Poluição da água" },
            new TipoDenuncia { IdTipoDenuncia = 3, Descricao = "Acúmulo e descarte irregular de lixo" },
            new TipoDenuncia { IdTipoDenuncia = 4, Descricao = "Crimes contra animais e vida selvagem" },
            new TipoDenuncia { IdTipoDenuncia = 5, Descricao = "Construções irregulares em áreas protegidas" },
            new TipoDenuncia { IdTipoDenuncia = 6, Descricao = "Poluição do ar nas áreas urbanas" },
            new TipoDenuncia { IdTipoDenuncia = 7, Descricao = "Outros" }
        );

        base.OnModelCreating(modelBuilder);
    }
}