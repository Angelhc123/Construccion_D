using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaReinicioPassword",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaSuspension",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoReinicioPassword",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoSuspension",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Suspendido",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimoAcceso",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CodigosRegistroDocente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Usado = table.Column<bool>(type: "bit", nullable: false),
                    FechaUso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    AdministradorId = table.Column<int>(type: "int", nullable: false),
                    DocenteId = table.Column<int>(type: "int", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodigosRegistroDocente");

            migrationBuilder.DropColumn(
                name: "FechaReinicioPassword",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaSuspension",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "MotivoReinicioPassword",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "MotivoSuspension",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Suspendido",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UltimoAcceso",
                table: "Usuarios");
        }
    }
}
