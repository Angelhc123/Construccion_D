using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AgregarSistemaAulas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Aulas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocenteId = table.Column<int>(type: "int", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CodigoVinculacion = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aulas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aulas_Docentes_DocenteId",
                        column: x => x.DocenteId,
                        principalTable: "Docentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EstudiantesAulas",
                columns: table => new
                {
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    AulaId = table.Column<int>(type: "int", nullable: false),
                    FechaVinculacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstudiantesAulas", x => new { x.EstudianteId, x.AulaId });
                    table.ForeignKey(
                        name: "FK_EstudiantesAulas_Aulas_AulaId",
                        column: x => x.AulaId,
                        principalTable: "Aulas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EstudiantesAulas_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aulas_CodigoVinculacion",
                table: "Aulas",
                column: "CodigoVinculacion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Aulas_DocenteId",
                table: "Aulas",
                column: "DocenteId");

            migrationBuilder.CreateIndex(
                name: "IX_EstudiantesAulas_AulaId",
                table: "EstudiantesAulas",
                column: "AulaId");

            migrationBuilder.CreateIndex(
                name: "IX_EstudiantesAulas_EstudianteId",
                table: "EstudiantesAulas",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_EstudiantesAulas_EstudianteId_Activo",
                table: "EstudiantesAulas",
                columns: new[] { "EstudianteId", "Activo" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstudiantesAulas");

            migrationBuilder.DropTable(
                name: "Aulas");
        }
    }
}
