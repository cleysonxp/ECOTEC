using EcoTec.API.Requests;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcoTec.API.Endpoints;

public static class DenunciaEndpoint
{
    public static void MapDenunciaEndPoint(this WebApplication app)
    {
        var groupBuilder = app.MapGroup("denuncia").WithTags("Denuncia");

        #region Denuncia

        // Criar denúncia
        groupBuilder.MapPost("", ([FromServices] EcoTecContext context, [FromBody] DenunciaRequest request, ClaimsPrincipal user) =>
        {
            // Recupera o ID do usuário autenticado pelo JWT
            var idUsuarioClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (idUsuarioClaim is null ||
                !int.TryParse(idUsuarioClaim.Value, out var idUsuario))
            {
                return Results.Unauthorized();
            }

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

                IdUsuario = idUsuario,

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


        // Listar denúncias próximas por geolocalização
        groupBuilder.MapGet("", ([FromServices] EcoTecContext context, double latitude, double longitude, double raioKm) =>
        {
            // Validar latitude
            if (latitude < -90 || latitude > 90)
            {
                return Results.BadRequest(new
                {
                    mensagem = "Latitude inválida. Utilize um valor entre -90 e 90."
                });
            }

            // Validar longitude
            if (longitude < -180 || longitude > 180)
            {
                return Results.BadRequest(new
                {
                    mensagem = "Longitude inválida. Utilize um valor entre -180 e 180."
                });
            }

            // Validar raio
            if (raioKm <= 0 || raioKm > 100)
            {
                return Results.BadRequest(new
                {
                    mensagem = "O raio deve ser maior que zero e menor ou igual a 100 km."
                });
            }

            // Buscar denúncias e seus relacionamentos
            var denuncias = context.Denuncias
                .Include(d => d.Usuario)
                .Include(d => d.TipoDenuncia)
                .Include(d => d.EnderecoDenuncia)
                .Include(d => d.Likes)
                .ToList();

            // Filtrar denúncias pela distância
            var denunciasProximas = denuncias
                .Where(d =>
                {
                    var endereco = d.EnderecoDenuncia;

                    if (endereco is null)
                        return false;

                    var distancia = CalcularDistanciaKm(
                        latitude,
                        longitude,
                        (double)endereco.Latitude,
                        (double)endereco.Longitude);

                    return distancia <= raioKm;
                })
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

            return Results.Ok(denunciasProximas);

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
        groupBuilder.MapGet("minhasDenuncias", ([FromServices] EcoTecContext context, ClaimsPrincipal user) =>
        {
            var idUsuarioClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (idUsuarioClaim is null ||
                !int.TryParse(idUsuarioClaim.Value, out var idUsuario))
            {
                return Results.Unauthorized();
            }

            var denuncias = context.Denuncias
                .Include(d => d.Usuario)
                .Include(d => d.TipoDenuncia)
                .Include(d => d.EnderecoDenuncia)
                .Include(d => d.Likes)
                .Where(d => d.IdUsuario == idUsuario)
                .OrderByDescending(d => d.DataHora)
                .Select(d => new
                {
                    id = d.IdDenuncia,
                    descricao = d.Descricao,
                    dataHora = d.DataHora,
                    imagem = d.Imagem,
                    video = d.Video,
                    status = d.DescrStatus,
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
        groupBuilder.MapPost("{id}/like", ([FromServices] EcoTecContext context, int id, ClaimsPrincipal user) =>
        {
            // Recupera o ID do usuário autenticado pelo JWT
            var idUsuarioClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (idUsuarioClaim is null ||
                !int.TryParse(idUsuarioClaim.Value, out var idUsuario))
            {
                return Results.Unauthorized();
            }

            // Verifica se a denúncia existe
            var denunciaExiste = context.Denuncias
                .Any(d => d.IdDenuncia == id);

            if (!denunciaExiste)
            {
                return Results.NotFound(new
                {
                    mensagem = "Denúncia não encontrada."
                });
            }

            // Verifica se o usuário já curtiu a denúncia
            var existeLike = context.DenunciasLike
                .Any(l => l.IdUsuario == idUsuario && l.IdDenuncia == id);

            if (existeLike)
            {
                return Results.BadRequest(new
                {
                    mensagem = "Você já curtiu esta denúncia."
                });
            }

            // Registra a curtida
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

    private static double CalcularDistanciaKm(
        double latitude1,
        double longitude1,
        double latitude2,
        double longitude2)
    {
        const double raioTerraKm = 6371.0;

        var lat1 = latitude1 * Math.PI / 180.0;
        var lat2 = latitude2 * Math.PI / 180.0;

        var diferencaLatitude =
            (latitude2 - latitude1) * Math.PI / 180.0;

        var diferencaLongitude =
            (longitude2 - longitude1) * Math.PI / 180.0;

        var a =
            Math.Pow(Math.Sin(diferencaLatitude / 2), 2) +
            Math.Cos(lat1) *
            Math.Cos(lat2) *
            Math.Pow(Math.Sin(diferencaLongitude / 2), 2);

        var c = 2 * Math.Atan2(
            Math.Sqrt(a),
            Math.Sqrt(1 - a));

        return raioTerraKm * c;
    }


}