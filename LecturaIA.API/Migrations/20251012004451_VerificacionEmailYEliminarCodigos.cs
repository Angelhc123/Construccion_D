using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class VerificacionEmailYEliminarCodigos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estudiantes_Docentes_DocenteId",
                table: "Estudiantes");

            migrationBuilder.DropTable(
                name: "CodigosRegistroDocente");

            migrationBuilder.DropTable(
                name: "CodigosRegistroEstudiante");

            migrationBuilder.DropIndex(
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes");

            migrationBuilder.DropIndex(
                name: "IX_Estudiantes_DocenteId",
                table: "Estudiantes");

            migrationBuilder.DropIndex(
                name: "IX_Docentes_CodigoDocente",
                table: "Docentes");

            migrationBuilder.DropColumn(
                name: "CodigoEstudiante",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "DocenteId",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "CodigoDocente",
                table: "Docentes");

            migrationBuilder.AddColumn<bool>(
                name: "EmailVerificado",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaExpiracionToken",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TokenVerificacion",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grado",
                table: "Estudiantes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seccion",
                table: "Estudiantes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Especialidad",
                table: "Docentes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerificado",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaExpiracionToken",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TokenVerificacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Grado",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "Seccion",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "Especialidad",
                table: "Docentes");

            migrationBuilder.AddColumn<string>(
                name: "CodigoEstudiante",
                table: "Estudiantes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DocenteId",
                table: "Estudiantes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CodigoDocente",
                table: "Docentes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CodigosRegistroDocente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdministradorId = table.Column<int>(type: "int", nullable: false),
                    DocenteId = table.Column<int>(type: "int", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaUso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Usado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosRegistroDocente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodigosRegistroDocente_Docentes_DocenteId",
                        column: x => x.DocenteId,
                        principalTable: "Docentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CodigosRegistroDocente_Usuarios_AdministradorId",
                        column: x => x.AdministradorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CodigosRegistroEstudiante",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocenteId = table.Column<int>(type: "int", nullable: false),
                    EstudianteId = table.Column<int>(type: "int", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaUso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Usado = table.Column<bool>(type: "bit", nullable: false)
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
                name: "IX_Estudiantes_CodigoEstudiante",
                table: "Estudiantes",
                column: "CodigoEstudiante");

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_DocenteId",
                table: "Estudiantes",
                column: "DocenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Docentes_CodigoDocente",
                table: "Docentes",
                column: "CodigoDocente",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroDocente_AdministradorId",
                table: "CodigosRegistroDocente",
                column: "AdministradorId");

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroDocente_Codigo",
                table: "CodigosRegistroDocente",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodigosRegistroDocente_DocenteId",
                table: "CodigosRegistroDocente",
                column: "DocenteId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Estudiantes_Docentes_DocenteId",
                table: "Estudiantes",
                column: "DocenteId",
                principalTable: "Docentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
