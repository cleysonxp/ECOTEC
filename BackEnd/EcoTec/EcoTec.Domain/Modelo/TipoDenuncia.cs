using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTec.Domain.Modelo;

[Table("TBL_TIPO_DENUNCIA")]
public class TipoDenuncia
{
    [Key]
    [Column("ID_TIPO_DENUNCIA")]
    public int IdTipoDenuncia { get; set; }

    [Required, MaxLength(100)]
    public string Descricao { get; set; } = string.Empty;

    public List<Denuncia> Denuncias { get; set; } = new();
}