using System.ComponentModel.DataAnnotations;

namespace EcoTec.Domain.Modelo;

public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Senha { get; set; } = string.Empty;
}