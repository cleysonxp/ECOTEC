using EcoTec.API.Requests;
using EcoTec.Infra.Banco;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace EcoTec.API.Endpoints;

public static class AuthEndPoint
{
    public static void MapAuthEndPoint(this WebApplication app)
    {
        var group = app.MapGroup("auth").WithTags("Auth");

        // LOGIN
        group.MapPost("login", async (
            EcoTecContext context,
            IConfiguration configuration,
            LoginRequest request) =>
        {
            // Validação básica
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Senha))
                return Results.BadRequest("Email e senha são obrigatórios");

            // Buscar usuário
            var usuario = await context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (usuario == null)
                return Results.Unauthorized();

            // Verificar senha
            var senhaValida = BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash);

            if (!senhaValida)
                return Results.Unauthorized();

            // Gerar JWT
            var key = configuration["Jwt:Key"];

            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

            var creds = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Retorno
            return Results.Ok(new
            {
                token = tokenString,
                usuario = new
                {
                    usuario.IdUsuario,
                    usuario.Nome,
                    usuario.Email
                }
            });
        });
    }
}