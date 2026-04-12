namespace EcoTec.API.Response;

public record EnderecoResponse(
    int IdEndereco,
    string Cep,
    string Estado,
    string Cidade,
    string Bairro,
    string Rua,
    int IdUsuario
);