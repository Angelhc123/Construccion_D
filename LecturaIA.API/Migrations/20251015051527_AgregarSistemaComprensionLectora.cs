using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AgregarSistemaComprensionLectora : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SesionesLectura",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    LecturaId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TiempoLecturaMinutos = table.Column<int>(type: "int", nullable: false),
                    Completada = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SesionesLectura", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SesionesLectura_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SesionesLectura_Lecturas_LecturaId",
                        column: x => x.LecturaId,
                        principalTable: "Lecturas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Cuestionarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SesionLecturaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturaId = table.Column<int>(type: "int", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NivelDificultad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TipoTexto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuestionarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cuestionarios_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Cuestionarios_Lecturas_LecturaId",
                        column: x => x.LecturaId,
                        principalTable: "Lecturas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Cuestionarios_SesionesLectura_SesionLecturaId",
                        column: x => x.SesionLecturaId,
                        principalTable: "SesionesLectura",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Preguntas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuestionarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Formato = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TextoPregunta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RespuestaCorrecta = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Explicacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Preguntas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Preguntas_Cuestionarios_CuestionarioId",
                        column: x => x.CuestionarioId,
                        principalTable: "Cuestionarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResultadosCuestionarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuestionarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    FechaEvaluacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PuntajeTotal = table.Column<int>(type: "int", nullable: false),
                    Porcentaje = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CorrectasLiterales = table.Column<int>(type: "int", nullable: false),
                    CorrectasAnaliticas = table.Column<int>(type: "int", nullable: false),
                    PuntajeCriticas = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: false),
                    RetroalimentacionPersonalizada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MensajeAnimo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NivelAnterior = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NivelNuevo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AccionNivel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MensajeAdaptacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadosCuestionarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResultadosCuestionarios_Cuestionarios_CuestionarioId",
                        column: x => x.CuestionarioId,
                        principalTable: "Cuestionarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResultadosCuestionarios_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RespuestasEstudiantes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PreguntaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: false),
                    TextoRespuesta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EsCorrecta = table.Column<bool>(type: "bit", nullable: true),
                    PuntajeIA = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RetroalimentacionIA = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaRespuesta = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RespuestasEstudiantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RespuestasEstudiantes_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RespuestasEstudiantes_Preguntas_PreguntaId",
                        column: x => x.PreguntaId,
                        principalTable: "Preguntas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_Estado",
                table: "Cuestionarios",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_EstudianteId",
                table: "Cuestionarios",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_LecturaId",
                table: "Cuestionarios",
                column: "LecturaId");

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_SesionLecturaId",
                table: "Cuestionarios",
                column: "SesionLecturaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Preguntas_CuestionarioId_Orden",
                table: "Preguntas",
                columns: new[] { "CuestionarioId", "Orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RespuestasEstudiantes_EstudianteId",
                table: "RespuestasEstudiantes",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_RespuestasEstudiantes_PreguntaId",
                table: "RespuestasEstudiantes",
                column: "PreguntaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosCuestionarios_CuestionarioId",
                table: "ResultadosCuestionarios",
                column: "CuestionarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosCuestionarios_EstudianteId",
                table: "ResultadosCuestionarios",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosCuestionarios_FechaEvaluacion",
                table: "ResultadosCuestionarios",
                column: "FechaEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_SesionesLectura_EstudianteId_LecturaId_FechaInicio",
                table: "SesionesLectura",
                columns: new[] { "EstudianteId", "LecturaId", "FechaInicio" });

            migrationBuilder.CreateIndex(
                name: "IX_SesionesLectura_LecturaId",
                table: "SesionesLectura",
                column: "LecturaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RespuestasEstudiantes");

            migrationBuilder.DropTable(
                name: "ResultadosCuestionarios");

            migrationBuilder.DropTable(
                name: "Preguntas");

            migrationBuilder.DropTable(
                name: "Cuestionarios");

            migrationBuilder.DropTable(
                name: "SesionesLectura");
        }
    }
}
