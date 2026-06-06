using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueIndexFromCodigoEstudiante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes");

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes",
                column: "CodigoEstudiante");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes");

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes",
                column: "CodigoEstudiante",
                unique: true);
        }
    }
}
