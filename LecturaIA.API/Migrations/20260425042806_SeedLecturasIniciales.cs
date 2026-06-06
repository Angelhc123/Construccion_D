using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LecturaIA.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedLecturasIniciales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Lecturas",
                columns: new[] { "Id", "EstudianteId", "Titulo", "Contenido", "UrlImagen", "TipoLectura", "Temas", "Personajes", "Escenario", "Longitud", "Emocion", "Proposito", "FechaCreacion", "EsFavorita", "Progreso", "Estado" },
                values: new object[,]
                {
                    { 
                        1001, 
                        null, 
                        "El Misterio del Bosque Encantado", 
                        "Había una vez en un bosque antiguo donde los árboles brillaban en la oscuridad. Dos pequeños aventureros decidieron recorrer sus senderos luminosos tras encontrar un mapa en el ático de su abuelo.", 
                        "https://images.unsplash.com/photo-1448375240586-882707db888b", 
                        "Narrativa", 
                        "[\"Aventura\", \"Magia\"]", 
                        "[\"Marco\", \"Sofia\"]", 
                        "Bosque Mágico", 
                        "Corta", 
                        "Asombro", 
                        "Entretener", 
                        new DateTime(2026, 4, 1, 10, 0, 0, 0, DateTimeKind.Utc), 
                        false, 
                        0, 
                        "pendiente" 
                    },
                    { 
                        1002, 
                        null, 
                        "El Ciclo del Agua", 
                        "El ciclo del agua es el proceso que mueve el agua por el planeta. Este fenómeno es vital para la vida, involucrando la evaporación, condensación, precipitación y recolección. Gracias a esto, todos los seres vivos podemos subsistir.", 
                        "https://images.unsplash.com/photo-1541427468627-a0662d53b26c", 
                        "Descriptiva", 
                        "[\"Ciencia\", \"Naturaleza\"]", 
                        "[]", 
                        "El Medio Ambiente", 
                        "Corta", 
                        "Curiosidad", 
                        "Informar", 
                        new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc), 
                        false, 
                        0, 
                        "pendiente" 
                    },
                    { 
                        1003, 
                        null, 
                        "La Odisea de las Galaxias", 
                        "La nave Explorer-X saltó al hiperespacio superando la velocidad de la luz. Su tripulación, conformada por androides y humanos, iba en busca del último planeta habitable reportado al borde de la Vía Láctea.", 
                        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", 
                        "Ciencia Ficción", 
                        "[\"Espacio\", \"Tecnología\"]", 
                        "[\"Capitan Leo\", \"Androide RX\"]", 
                        "Nave Espacial en el futuro", 
                        "Mediana", 
                        "Tensión", 
                        "Imaginación", 
                        new DateTime(2026, 4, 3, 10, 0, 0, 0, DateTimeKind.Utc), 
                        false, 
                        0, 
                        "pendiente" 
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Lecturas",
                keyColumn: "Id",
                keyValues: new object[] { 1001, 1002, 1003 });
        }
    }
}
