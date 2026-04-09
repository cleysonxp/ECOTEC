using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcoTec.Domain.Modelo;

[Table("TBL_DENUNCIA_LIKE")]
public class DenunciaLike
{
    [Column("ID_USUARIO")]
    public int IdUsuario { get; set; }

    [Column("ID_DENUNCIA")]
    public int IdDenuncia { get; set; }

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;

    [ForeignKey("IdDenuncia")]
    public Denuncia Denuncia { get; set; } = null!;
}