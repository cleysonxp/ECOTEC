using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTec.Domain.Modelo;

[Table("TBL_ENDERECO_DENUNCIA")]
public class EnderecoDenuncia
{
    [Key]
    [Column("ID_ENDERECO_DENUNCIA")]
    public int IdEnderecoDenuncia { get; set; }

    [Required, MaxLength(4000)]
    public string Logradouro { get; set; } = string.Empty;

    [Required]
    public int Numero { get; set; }

    [MaxLength(200)]
    public string PontoReferencia { get; set; } = string.Empty;

    [Required]
    public decimal Latitude { get; set; }

    [Required]
    public decimal Longitude { get; set; }

    [Required, MaxLength(100)]
    public string Cep { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Estado { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Cidade { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Bairro { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Rua { get; set; } = string.Empty;

    // 1:1
    public Denuncia Denuncia { get; set; } = null!;
}