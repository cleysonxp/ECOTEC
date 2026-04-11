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
        #region Usuario
        app.MapGet("/usuarios", ([FromServices] DAL<Usuario> dal) =>
        {
            return dal.Listar(u => u.Endereco);
        });

        app.MapGet("/usuarios/{id}", ([FromServices] EcoTecContext context, int id) =>
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
        });

        app.MapPost("/usuarios", ([FromServices] DAL<Usuario> dal, [FromBody] UsuarioRequest usuarioRequest) =>
        {
            var usuario = new Usuario
            {
                Nome = usuarioRequest.Nome,
                Email = usuarioRequest.Email,
                Senha = usuarioRequest.Senha
            };
            dal.Adicionar(usuario);
            return Results.Ok();
        });

        app.MapDelete("/usuarios/{id}", ([FromServices] DAL<Usuario> dal, int id) =>
        {
            var usuario = dal.RecuperarPor(a => a.IdUsuario == id);
            if (usuario is null)
            {
                return Results.NotFound();
            }
            dal.Deletar(usuario);
            return Results.NoContent();
        });

        app.MapPut("/usuarios/{id}", ([FromServices] DAL<Usuario> dal, [FromBody] UsuarioRequest usuarioRequest, int id) =>
        {
            var usuarioAtualizar = dal.RecuperarPor(a => a.IdUsuario == id);
            if (usuarioAtualizar is null)
            {
                return Results.NotFound();
            }
            usuarioAtualizar.Senha = usuarioRequest.Senha;

            dal.Atualizar(usuarioAtualizar);


            return Results.NoContent();
        });
        #endregion
    }
}
