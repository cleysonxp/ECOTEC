using EcoTec.API.Requests;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.API.Endpoints;

public static class UsuarioEndpoint
{
    public static void MapUsuarioEndPoint(this WebApplication app)
    {
        var groupBuilder = app.MapGroup("usuario").WithTags("Usuario");

        #region Usuario

        // Listar todos usuarios
        groupBuilder.MapGet("", ([FromServices] DAL<Usuario> dal) =>
        {
            return dal.Listar(u => u.Endereco);
        }).RequireAuthorization();

        // Listar usuario por id
        groupBuilder.MapGet("{id}", ([FromServices] EcoTecContext context, int id) =>
        {
            var usuario = context.Usuarios
                .Include(u => u.Endereco)
                .FirstOrDefault(u => u.IdUsuario == id);

            if (usuario == null)
            {
                return Results.NotFound(new
                {
                    mensagem = "Usuário não encontrado"
                });
            }

            return Results.Ok(new
            {
                mensagem = "Usuário encontrado",
                dados = usuario
            });
        }).RequireAuthorization();

        // Criar usuario
        groupBuilder.MapPost("", ([FromServices] DAL<Usuario> dal, [FromBody] UsuarioRequest usuarioRequest) =>
        {
            var usuario = new Usuario
            {
                Nome = usuarioRequest.Nome,
                Email = usuarioRequest.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(usuarioRequest.Senha)
            };
            dal.Adicionar(usuario);
            return Results.Ok();
        });        

        // Atualizar usuario
        groupBuilder.MapPut("{id}", ([FromServices] DAL<Usuario> dal, [FromBody] UsuarioRequest usuarioRequest, int id) =>
        {
            var usuarioAtualizar = dal.RecuperarPor(a => a.IdUsuario == id);
            if (usuarioAtualizar is null)
            {
                return Results.NotFound();
            }
            usuarioAtualizar.SenhaHash = usuarioRequest.Senha;

            dal.Atualizar(usuarioAtualizar);


            return Results.NoContent();
        }).RequireAuthorization();
        #endregion
    }
}
