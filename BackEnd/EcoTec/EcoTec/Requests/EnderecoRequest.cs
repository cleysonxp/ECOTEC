namespace EcoTec.API.Requests;

public record EnderecoRequest(
    string Cep, 
    string Estado, 
    string Cidade, 
    string Bairro, 
    string Rua, 
    int IdUsuario);