using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class AgregarSistema2FA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiereDobleAutenticacion",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CodigosVerificacionLogin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaExpiracion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Usado = table.Column<bool>(type: "bit", nullable: false),
                    IntentosRestantes = table.Column<int>(type: "int", nullable: false),
                    DireccionIP = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosVerificacionLogin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodigosVerificacionLogin_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodigosVerificacionLogin_Codigo",
                table: "CodigosVerificacionLogin",
                column: "Codigo");

            migrationBuilder.CreateIndex(
                name: "IX_CodigosVerificacionLogin_UsuarioId_FechaGeneracion",
                table: "CodigosVerificacionLogin",
                columns: new[] { "UsuarioId", "FechaGeneracion" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodigosVerificacionLogin");

            migrationBuilder.DropColumn(
                name: "RequiereDobleAutenticacion",
                table: "Usuarios");
        }
    }
}
