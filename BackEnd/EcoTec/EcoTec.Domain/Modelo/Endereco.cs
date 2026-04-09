using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcoTec.Domain.Modelo;

[Table("TBL_ENDERECO")]
public class Endereco
{
    [Key]
    [Column("ID_ENDERECO")]
    public int IdEndereco { get; set; }

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

    [Required]
    [Column("ID_USUARIO")]
    public int IdUsuario { get; set; }

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;
}