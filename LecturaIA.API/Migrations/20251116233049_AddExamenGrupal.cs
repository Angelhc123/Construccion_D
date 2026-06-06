using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExamenGrupal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamenesGrupales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AulaId = table.Column<int>(type: "int", nullable: false),
                    DocenteId = table.Column<int>(type: "int", nullable: false),
                    LecturaId = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LongitudTexto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GradoEscolar = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Complejidad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaLimite = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Publicado = table.Column<bool>(type: "bit", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamenesGrupales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamenesGrupales_Aulas_AulaId",
                        column: x => x.AulaId,
                        principalTable: "Aulas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExamenesGrupales_Docentes_DocenteId",
                        column: x => x.DocenteId,
                        principalTable: "Docentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExamenesGrupales_Lecturas_LecturaId",
                        column: x => x.LecturaId,
                        principalTable: "Lecturas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AsignacionesExamen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamenGrupalId = table.Column<int>(type: "int", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCompletado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SesionLecturaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Calificacion = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsignacionesExamen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AsignacionesExamen_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AsignacionesExamen_ExamenesGrupales_ExamenGrupalId",
                        column: x => x.ExamenGrupalId,
                        principalTable: "ExamenesGrupales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsignacionesExamen_SesionesLectura_SesionLecturaId",
                        column: x => x.SesionLecturaId,
                        principalTable: "SesionesLectura",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionesExamen_EstudianteId",
                table: "AsignacionesExamen",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionesExamen_EstudianteId_Estado",
                table: "AsignacionesExamen",
                columns: new[] { "EstudianteId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionesExamen_ExamenGrupalId_EstudianteId",
                table: "AsignacionesExamen",
                columns: new[] { "ExamenGrupalId", "EstudianteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionesExamen_SesionLecturaId",
                table: "AsignacionesExamen",
                column: "SesionLecturaId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamenesGrupales_AulaId",
                table: "ExamenesGrupales",
                column: "AulaId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamenesGrupales_AulaId_Publicado_Activo",
                table: "ExamenesGrupales",
                columns: new[] { "AulaId", "Publicado", "Activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ExamenesGrupales_DocenteId",
                table: "ExamenesGrupales",
                column: "DocenteId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamenesGrupales_LecturaId",
                table: "ExamenesGrupales",
                column: "LecturaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AsignacionesExamen");

            migrationBuilder.DropTable(
                name: "ExamenesGrupales");
        }
    }
}
