using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoUsuario = table.Column<int>(type: "int", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Docentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    CodigoDocente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Institucion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Docentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Docentes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Estudiantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    CodigoEstudiante = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DocenteId = table.Column<int>(type: "int", nullable: false),
                    Edad = table.Column<int>(type: "int", nullable: true),
                    NivelEducativo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Intereses = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NivelDificultad = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estudiantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Estudiantes_Docentes_DocenteId",
                        column: x => x.DocenteId,
                        principalTable: "Docentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Estudiantes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodigosRegistroEstudiante",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DocenteId = table.Column<int>(type: "int", nullable: false),
                    Usado = table.Column<bool>(type: "bit", nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaUso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstudianteId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosRegistroEstudiante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodigosRegistroEstudiante_Docentes_DocenteId",
                        column: x => x.DocenteId,
                        principalTable: "Docentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CodigosRegistroEstudiante_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroEstudiante_Codigo",
                table: "CodigosRegistroEstudiante",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroEstudiante_DocenteId",
                table: "CodigosRegistroEstudiante",
                column: "DocenteId");

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroEstudiante_EstudianteId",
                table: "CodigosRegistroEstudiante",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_Docentes_CodigoDocente",
                table: "Docentes",
                column: "CodigoDocente",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Docentes_UsuarioId",
                table: "Docentes",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes",
                column: "CodigoEstudiante",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_DocenteId",
                table: "Estudiantes",
                column: "DocenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_UsuarioId",
                table: "Estudiantes",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodigosRegistroEstudiante");

            migrationBuilder.DropTable(
                name: "Estudiantes");

            migrationBuilder.DropTable(
                name: "Docentes");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
