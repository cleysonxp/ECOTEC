using EcoTec.Domain.Modelo;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("TBL_DENUNCIA")]
public class Denuncia
{
    [Key]
    [Column("ID_DENUNCIA")]
    public int IdDenuncia { get; set; }

    [Required, MaxLength(4000)]
    [Column("DESCRICAO")]
    public string Descricao { get; set; } = string.Empty;

    [Required]
    [Column("DATA_HORA")]
    public DateTime DataHora { get; set; }

    [Column("IMAGEM")]
    public byte[]? Imagem { get; set; }

    [Column("VIDEO")]
    public byte[]? Video { get; set; }

    [Required]
    [Column("COD_STATUS")]
    public int CodStatus { get; set; }

    [MaxLength(100)]
    [Column("DESCR_STATUS")]
    public string? DescrStatus { get; set; }

    // FK Usuario
    [Required]
    [Column("ID_USUARIO")]
    public int IdUsuario { get; set; }

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;

    // FK Tipo
    [Required]
    [Column("ID_TIPO_DENUNCIA")]
    public int IdTipoDenuncia { get; set; }

    [ForeignKey("IdTipoDenuncia")]
    public TipoDenuncia TipoDenuncia { get; set; } = null!;

    // FK EnderecoDenuncia
    [Required]
    [Column("ID_ENDERECO_DENUNCIA")]
    public int IdEnderecoDenuncia { get; set; }

    [ForeignKey("IdEnderecoDenuncia")]
    public EnderecoDenuncia EnderecoDenuncia { get; set; } = null!;

    public List<DenunciaLike> Likes { get; set; } = new();
}