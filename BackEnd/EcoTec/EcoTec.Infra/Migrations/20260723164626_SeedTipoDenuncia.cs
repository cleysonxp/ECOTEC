using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EcoTec.Infra.Migrations
{
    /// <inheritdoc />
    public partial class SeedTipoDenuncia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TBL_TIPO_DENUNCIA",
                columns: new[] { "ID_TIPO_DENUNCIA", "Descricao" },
                values: new object[,]
                {
                    { 1, "Desmatamento e queimadas" },
                    { 2, "Poluição da água" },
                    { 3, "Acúmulo e descarte irregular de lixo" },
                    { 4, "Crimes contra animais e vida selvagem" },
                    { 5, "Construções irregulares em áreas protegidas" },
                    { 6, "Poluição do ar nas áreas urbanas  " },
                    { 7, "Outros" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "TBL_TIPO_DENUNCIA",
                keyColumn: "ID_TIPO_DENUNCIA",
                keyValue: 7);
        }
    }
}
