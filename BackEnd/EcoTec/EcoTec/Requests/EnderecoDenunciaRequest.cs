namespace EcoTec.API.Requests;

public record EnderecoDenunciaRequest(
    string Cep,
    string Estado,
    string Cidade,
    string Bairro,
    string Rua,
    int Numero,
    string PontoReferencia,
    decimal Latitude,
    decimal Longitude
);