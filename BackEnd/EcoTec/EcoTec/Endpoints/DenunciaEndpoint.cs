using EcoTec.API.Requests;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoTec.API.Endpoints;

public static class DenunciaEndpoint
{
    public static void MapDenunciaEndPoint(this WebApplication app)
    {
        var groupBuilder = app.MapGroup("denuncia").WithTags("Denuncia");

        #region Denuncia

        // Criar denúncia
        groupBuilder.MapPost("", ([FromServices] EcoTecContext context, [FromBody] DenunciaRequest request) =>
        {
            // Cria o endereço da denúncia
            var endereco = new EnderecoDenuncia
            {
                Cep = request.Endereco.Cep,
                Estado = request.Endereco.Estado,
                Cidade = request.Endereco.Cidade,
                Bairro = request.Endereco.Bairro,
                Rua = request.Endereco.Rua,
                Numero = request.Endereco.Numero,
                PontoReferencia = request.Endereco.PontoReferencia,
                Latitude = request.Endereco.Latitude,
                Longitude = request.Endereco.Longitude
            };

            context.EnderecosDenuncia.Add(endereco);
            context.SaveChanges();

            // Cria a denúncia
            var denuncia = new Denuncia
            {
                Descricao = request.Descricao,
                Imagem = request.Imagem,
                Video = request.Video,
                DataHora = DateTime.Now,

                CodStatus = 1,
                DescrStatus = "Em análise",

                IdUsuario = 1, // Depois será obtido do JWT

                IdTipoDenuncia = request.IdTipoDenuncia,
                IdEnderecoDenuncia = endereco.IdEnderecoDenuncia
            };

            context.Denuncias.Add(denuncia);
            context.SaveChanges();

            return Results.Created($"/denuncia/{denuncia.IdDenuncia}", new
            {
                mensagem = "Denúncia cadastrada com sucesso.",
                id = denuncia.IdDenuncia
            });

        }).RequireAuthorization();

        // Listar todas as denúncias
        groupBuilder.MapGet("", ([FromServices] EcoTecContext context) =>
        {
            var denuncias = context.Denuncias
                .Include(d => d.Usuario)
                .Include(d => d.TipoDenuncia)
                .Include(d => d.EnderecoDenuncia)
                .Include(d => d.Likes)
                .OrderByDescending(d => d.DataHora)
                .Select(d => new
                {
                    id = d.IdDenuncia,
                    descricao = d.Descricao,
                    dataHora = d.DataHora,
                    imagem = d.Imagem,
                    video = d.Video,
                    status = d.DescrStatus,

                    usuario = new
                    {
                        id = d.Usuario.IdUsuario,
                        nome = d.Usuario.Nome
                    },

                    tipo = d.TipoDenuncia.Descricao,

                    endereco = new
                    {
                        cidade = d.EnderecoDenuncia.Cidade,
                        bairro = d.EnderecoDenuncia.Bairro,
                        rua = d.EnderecoDenuncia.Rua,
                        numero = d.EnderecoDenuncia.Numero,
                        latitude = d.EnderecoDenuncia.Latitude,
                        longitude = d.EnderecoDenuncia.Longitude
                    },

                    quantidadeLikes = d.Likes.Count
                })
                .ToList();

            return Results.Ok(denuncias);

        }).RequireAuthorization();

        // Buscar denúncia por id
        groupBuilder.MapGet("{id}", ([FromServices] EcoTecContext context, int id) =>
        {
            var denuncia = context.Denuncias
                .Include(d => d.Usuario)
                .Include(d => d.TipoDenuncia)
                .Include(d => d.EnderecoDenuncia)
                .Include(d => d.Likes)
                .Where(d => d.IdDenuncia == id)
                .Select(d => new
                {
                    id = d.IdDenuncia,
                    descricao = d.Descricao,
                    dataHora = d.DataHora,
                    imagem = d.Imagem,
                    video = d.Video,
                    status = d.DescrStatus,

                    usuario = new
                    {
                        id = d.Usuario.IdUsuario,
                        nome = d.Usuario.Nome
                    },

                    tipo = d.TipoDenuncia.Descricao,

                    endereco = new
                    {
                        cep = d.EnderecoDenuncia.Cep,
                        estado = d.EnderecoDenuncia.Estado,
                        cidade = d.EnderecoDenuncia.Cidade,
                        bairro = d.EnderecoDenuncia.Bairro,
                        rua = d.EnderecoDenuncia.Rua,
                        numero = d.EnderecoDenuncia.Numero,
                        pontoReferencia = d.EnderecoDenuncia.PontoReferencia,
                        latitude = d.EnderecoDenuncia.Latitude,
                        longitude = d.EnderecoDenuncia.Longitude
                    },

                    quantidadeLikes = d.Likes.Count
                })
                .FirstOrDefault();

            if (denuncia == null)
            {
                return Results.NotFound(new
                {
                    mensagem = "Denúncia não encontrada."
                });
            }

            return Results.Ok(denuncia);

        }).RequireAuthorization();

        // Listar denúncias do usuário
        groupBuilder.MapGet("usuario/{id}", ([FromServices] EcoTecContext context, int id) =>
        {
            var denuncias = context.Denuncias
                .Include(d => d.Usuario)
                .Include(d => d.TipoDenuncia)
                .Include(d => d.EnderecoDenuncia)
                .Include(d => d.Likes)
                .Where(d => d.IdUsuario == id)
                .OrderByDescending(d => d.DataHora)
                .Select(d => new
                {
                    id = d.IdDenuncia,
                    descricao = d.Descricao,
                    dataHora = d.DataHora,
                    imagem = d.Imagem,
                    video = d.Video,
                    status = d.DescrStatus,

                    //usuario = new
                    //{
                    //    id = d.Usuario.IdUsuario,
                    //    nome = d.Usuario.Nome
                    //},

                    tipo = d.TipoDenuncia.Descricao,

                    endereco = new
                    {
                        cidade = d.EnderecoDenuncia.Cidade,
                        bairro = d.EnderecoDenuncia.Bairro,
                        rua = d.EnderecoDenuncia.Rua,
                        numero = d.EnderecoDenuncia.Numero
                    },

                    quantidadeLikes = d.Likes.Count
                })
                .ToList();

            return Results.Ok(denuncias);

        }).RequireAuthorization();

        // Like denúncia
        groupBuilder.MapPost("{id}/like", ([FromServices] EcoTecContext context, int id) =>
        {
            int idUsuario = 1; // Depois vamos pegar do JWT

            var existeLike = context.DenunciasLike
                .Any(l => l.IdUsuario == idUsuario && l.IdDenuncia == id);

            if (existeLike)
            {
                return Results.BadRequest(new
                {
                    mensagem = "Você já curtiu esta denúncia."
                });
            }

            var like = new DenunciaLike
            {
                IdUsuario = idUsuario,
                IdDenuncia = id
            };

            context.DenunciasLike.Add(like);
            context.SaveChanges();

            return Results.Ok(new
            {
                mensagem = "Curtida realizada com sucesso."
            });

        }).RequireAuthorization();

        #endregion
    }
}