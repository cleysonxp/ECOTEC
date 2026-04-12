using EcoTec.API.Requests;
using EcoTec.API.Response;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.API.Endpoints;

public static class EnderecoEndpoint
{
    public static void MapEnderecoEndpoint(this WebApplication app)
    {
        var groupBuilder = app.MapGroup("endereco").WithTags("Endereco");

        #region Endereco

        // Listar endereços
        groupBuilder.MapGet("", ([FromServices] DAL<Endereco> dal) =>
        {
            return dal.Listar();
        });
       
        // Criar endereço
        groupBuilder.MapPost("", ([FromServices] DAL<Endereco> dal, [FromBody] EnderecoRequest enderecoRequest) =>
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

        // Listar endereço de usuario especifico
        groupBuilder.MapGet("{idUsuario}", ([FromServices] DAL<Endereco> dal, int idUsuario) =>
        {
            var endereco = dal.RecuperarPor(f => f.IdUsuario == idUsuario);

            if (endereco is null)
                return Results.NotFound($"Endereço não foi encontrado.");

            var enderecoResponse = new EnderecoResponse(
                endereco.IdEndereco, 
                endereco.Cep,
                endereco.Estado, 
                endereco.Cidade, 
                endereco.Bairro, 
                endereco.Rua,
                endereco.IdUsuario
            );

            return Results.Ok(enderecoResponse);            
        });

        #endregion
    }
}
