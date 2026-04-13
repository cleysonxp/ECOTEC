namespace EcoTec.API.Requests;

public record LoginRequest(
    string Email,
    string Senha
);