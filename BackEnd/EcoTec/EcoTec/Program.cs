using EcoTec.API.Endpoints;
using EcoTec.Domain.Modelo;
using EcoTec.Infra.Banco;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ?? Configuração do banco de dados (Entity Framework)
//builder.Services.AddDbContext<EcoTecContext>(options =>
//{
//    options.UseMySql(builder.Configuration.GetConnectionString("Default"), ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default"))
//);

builder.Services.AddDbContext<EcoTecContext>();
builder.Services.AddTransient<DAL<Usuario>>();
builder.Services.AddTransient<DAL<Endereco>>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

var app = builder.Build();

app.MapUsuarioEndPoint();
app.MapEnderecoEndpoint();

app.UseSwagger();
app.UseSwaggerUI();

app.Run();
