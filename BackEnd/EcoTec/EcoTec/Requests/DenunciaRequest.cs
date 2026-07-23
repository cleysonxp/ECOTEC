namespace EcoTec.API.Requests;

public record DenunciaRequest(
    string Descricao,
    byte[]? Imagem,
    byte[]? Video,
    int IdTipoDenuncia,
    EnderecoDenunciaRequest Endereco
);