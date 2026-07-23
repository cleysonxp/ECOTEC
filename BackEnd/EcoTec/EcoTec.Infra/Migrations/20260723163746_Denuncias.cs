using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcoTec.Infra.Migrations
{
    /// <inheritdoc />
    public partial class Denuncias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TBL_ENDERECO_DENUNCIA",
                columns: table => new
                {
                    ID_ENDERECO_DENUNCIA = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Logradouro = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Numero = table.Column<int>(type: "int", nullable: false),
                    PontoReferencia = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Latitude = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Cep = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Estado = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Cidade = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Bairro = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Rua = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TBL_ENDERECO_DENUNCIA", x => x.ID_ENDERECO_DENUNCIA);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TBL_TIPO_DENUNCIA",
                columns: table => new
                {
                    ID_TIPO_DENUNCIA = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Descricao = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TBL_TIPO_DENUNCIA", x => x.ID_TIPO_DENUNCIA);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TBL_DENUNCIA",
                columns: table => new
                {
                    ID_DENUNCIA = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DESCRICAO = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DATA_HORA = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IMAGEM = table.Column<byte[]>(type: "longblob", nullable: true),
                    VIDEO = table.Column<byte[]>(type: "longblob", nullable: true),
                    COD_STATUS = table.Column<int>(type: "int", nullable: false),
                    DESCR_STATUS = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ID_USUARIO = table.Column<int>(type: "int", nullable: false),
                    ID_TIPO_DENUNCIA = table.Column<int>(type: "int", nullable: false),
                    ID_ENDERECO_DENUNCIA = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TBL_DENUNCIA", x => x.ID_DENUNCIA);
                    table.ForeignKey(
                        name: "FK_TBL_DENUNCIA_TBL_ENDERECO_DENUNCIA_ID_ENDERECO_DENUNCIA",
                        column: x => x.ID_ENDERECO_DENUNCIA,
                        principalTable: "TBL_ENDERECO_DENUNCIA",
                        principalColumn: "ID_ENDERECO_DENUNCIA",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TBL_DENUNCIA_TBL_TIPO_DENUNCIA_ID_TIPO_DENUNCIA",
                        column: x => x.ID_TIPO_DENUNCIA,
                        principalTable: "TBL_TIPO_DENUNCIA",
                        principalColumn: "ID_TIPO_DENUNCIA",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TBL_DENUNCIA_TBL_USUARIO_ID_USUARIO",
                        column: x => x.ID_USUARIO,
                        principalTable: "TBL_USUARIO",
                        principalColumn: "ID_USUARIO",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TBL_DENUNCIA_LIKE",
                columns: table => new
                {
                    ID_USUARIO = table.Column<int>(type: "int", nullable: false),
                    ID_DENUNCIA = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TBL_DENUNCIA_LIKE", x => new { x.ID_USUARIO, x.ID_DENUNCIA });
                    table.ForeignKey(
                        name: "FK_TBL_DENUNCIA_LIKE_TBL_DENUNCIA_ID_DENUNCIA",
                        column: x => x.ID_DENUNCIA,
                        principalTable: "TBL_DENUNCIA",
                        principalColumn: "ID_DENUNCIA",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TBL_DENUNCIA_LIKE_TBL_USUARIO_ID_USUARIO",
                        column: x => x.ID_USUARIO,
                        principalTable: "TBL_USUARIO",
                        principalColumn: "ID_USUARIO",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_TBL_DENUNCIA_ID_ENDERECO_DENUNCIA",
                table: "TBL_DENUNCIA",
                column: "ID_ENDERECO_DENUNCIA",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TBL_DENUNCIA_ID_TIPO_DENUNCIA",
                table: "TBL_DENUNCIA",
                column: "ID_TIPO_DENUNCIA");

            migrationBuilder.CreateIndex(
                name: "IX_TBL_DENUNCIA_ID_USUARIO",
                table: "TBL_DENUNCIA",
                column: "ID_USUARIO");

            migrationBuilder.CreateIndex(
                name: "IX_TBL_DENUNCIA_LIKE_ID_DENUNCIA",
                table: "TBL_DENUNCIA_LIKE",
                column: "ID_DENUNCIA");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TBL_DENUNCIA_LIKE");

            migrationBuilder.DropTable(
                name: "TBL_DENUNCIA");

            migrationBuilder.DropTable(
                name: "TBL_ENDERECO_DENUNCIA");

            migrationBuilder.DropTable(
                name: "TBL_TIPO_DENUNCIA");
        }
    }
}
