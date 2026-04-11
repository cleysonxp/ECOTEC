using EcoTec.API.Requests;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.API.Endpoints;

public static class EnderecoEndpoint
{
    public static void MapEnderecoEndpoint(this WebApplication app)
    {
        #region Endereco
        app.MapGet("/enderecos", ([FromServices] DAL<Endereco> dal) =>
        {
            return dal.Listar();
        });
       
        app.MapPost("/enderecos", ([FromServices] DAL<Endereco> dal, [FromBody] EnderecoRequest enderecoRequest) =>
        {
            var usuario = dal.RecuperarPor(a => a.IdUsuario == enderecoRequest.IdUsuario);
            if (usuario != null)
            {
                return Results.BadRequest("Usuário já possui um endereço cadastrado.");
            }
            var endereco = new Endereco
            {
                Cep = enderecoRequest.Cep,
                Estado = enderecoRequest.Estado,
                Cidade = enderecoRequest.Cidade,
                Bairro = enderecoRequest.Bairro,
                Rua = enderecoRequest.Rua,
                IdUsuario = enderecoRequest.IdUsuario
            };
            dal.Adicionar(endereco);
            return Results.Ok();
        });
        #endregion
    }
}
