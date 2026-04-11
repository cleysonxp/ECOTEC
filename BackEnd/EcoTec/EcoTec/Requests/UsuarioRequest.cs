namespace EcoTec.API.Requests;

public record UsuarioRequest(
    string Nome, 
    string Email, 
    string Senha);

