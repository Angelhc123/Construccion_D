using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTiempoCuestionario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TiempoCuestionarioMinutos",
                table: "ResultadosCuestionarios",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TiempoCuestionarioMinutos",
                table: "ResultadosCuestionarios");
        }
    }
}
