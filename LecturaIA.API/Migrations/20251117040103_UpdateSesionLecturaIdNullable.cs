using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSesionLecturaIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cuestionarios_SesionLecturaId",
                table: "Cuestionarios");

            migrationBuilder.AlterColumn<Guid>(
                name: "SesionLecturaId",
                table: "Cuestionarios",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_SesionLecturaId",
                table: "Cuestionarios",
                column: "SesionLecturaId",
                unique: true,
                filter: "[SesionLecturaId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cuestionarios_SesionLecturaId",
                table: "Cuestionarios");

            migrationBuilder.AlterColumn<Guid>(
                name: "SesionLecturaId",
                table: "Cuestionarios",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_SesionLecturaId",
                table: "Cuestionarios",
                column: "SesionLecturaId",
                unique: true);
        }
    }
}
