using LecturaIA.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LecturaIA.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Estudiante> Estudiantes { get; set; }
    public DbSet<Docente> Docentes { get; set; }
    public DbSet<CodigoVerificacionLogin> CodigosVerificacionLogin { get; set; }
    public DbSet<Lectura> Lecturas { get; set; }
    
    // CU-005, CU-006, CU-007: Sistema de Comprensión Lectora
    public DbSet<SesionLectura> SesionesLectura { get; set; }
    public DbSet<Cuestionario> Cuestionarios { get; set; }
    public DbSet<Pregunta> Preguntas { get; set; }
    public DbSet<RespuestaEstudiante> RespuestasEstudiantes { get; set; }
    public DbSet<ResultadoCuestionario> ResultadosCuestionarios { get; set; }
    
    // CU-008: Sistema de Aulas y Vinculación
    public DbSet<Aula> Aulas { get; set; }
    public DbSet<EstudianteAula> EstudiantesAulas { get; set; }
    
    // CU-013: Sistema de Exámenes Grupales
    public DbSet<ExamenGrupal> ExamenesGrupales { get; set; }
    public DbSet<AsignacionExamen> AsignacionesExamen { get; set; }
    
    // Sistema de códigos ELIMINADO - Ahora se usa verificación por email

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración Usuario
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.NombreCompleto).IsRequired().HasMaxLength(200);

            // Relación 1:1 con Estudiante
            entity.HasOne(u => u.Estudiante)
                .WithOne(e => e.Usuario)
                .HasForeignKey<Estudiante>(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación 1:1 con Docente
            entity.HasOne(u => u.Docente)
                .WithOne(d => d.Usuario)
                .HasForeignKey<Docente>(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuración Estudiante
        modelBuilder.Entity<Estudiante>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Grado)
                .IsRequired()
                .HasConversion<int>(); // Guarda como int en BD
            entity.Property(e => e.Edad).IsRequired();
            entity.Property(e => e.NivelEducativo).HasMaxLength(50);
            entity.Property(e => e.Intereses).HasMaxLength(500);
        });

        // Configuración Docente
        modelBuilder.Entity<Docente>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        // Configuración Lectura
        modelBuilder.Entity<Lectura>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Contenido).IsRequired();
            entity.Property(e => e.TipoLectura).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Temas).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Personajes).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Escenario).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Longitud).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Emocion).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Proposito).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Estado).IsRequired().HasMaxLength(50);
            entity.Property(e => e.UrlImagen).HasMaxLength(500);

            // Relación con Estudiante
            entity.HasOne(l => l.Estudiante)
                .WithMany()
                .HasForeignKey(l => l.EstudianteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuración CodigoVerificacionLogin (2FA para docentes)
        modelBuilder.Entity<CodigoVerificacionLogin>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Codigo).IsRequired().HasMaxLength(6);
            entity.Property(e => e.FechaGeneracion).IsRequired();
            entity.Property(e => e.FechaExpiracion).IsRequired();
            entity.Property(e => e.Usado).IsRequired();
            entity.Property(e => e.IntentosRestantes).IsRequired();
            entity.Property(e => e.DireccionIP).HasMaxLength(50);

            // Relación con Usuario
            entity.HasOne(c => c.Usuario)
                .WithMany(u => u.CodigosVerificacion)
                .HasForeignKey(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índices para búsqueda rápida
            entity.HasIndex(e => e.Codigo);
            entity.HasIndex(e => new { e.UsuarioId, e.FechaGeneracion });
        });

        // ===== SISTEMA DE CÓDIGOS ELIMINADO =====
        // Ya no se usa el sistema de códigos de registro
        // Ahora todo se maneja con verificación por email

        // ===== CU-005, CU-006, CU-007: SISTEMA DE COMPRENSIÓN LECTORA =====
        
        // Configuración SesionLectura
        modelBuilder.Entity<SesionLectura>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FechaInicio).IsRequired();
            entity.Property(e => e.TiempoLecturaMinutos).IsRequired();
            entity.Property(e => e.Completada).IsRequired();

            // Relación con Estudiante
            entity.HasOne(s => s.Estudiante)
                .WithMany()
                .HasForeignKey(s => s.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación con Lectura
            entity.HasOne(s => s.Lectura)
                .WithMany()
                .HasForeignKey(s => s.LecturaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación 1:1 con Cuestionario (opcional)
            entity.HasOne(s => s.Cuestionario)
                .WithOne(c => c.SesionLectura)
                .HasForeignKey<Cuestionario>(c => c.SesionLecturaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            entity.HasIndex(e => new { e.EstudianteId, e.LecturaId, e.FechaInicio });
        });

        // Configuración Cuestionario
        modelBuilder.Entity<Cuestionario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FechaGeneracion).IsRequired();
            entity.Property(e => e.Estado).IsRequired().HasMaxLength(20);
            entity.Property(e => e.NivelDificultad).HasMaxLength(20);
            entity.Property(e => e.TipoTexto).HasMaxLength(50);

            // Relación con Lectura
            entity.HasOne(c => c.Lectura)
                .WithMany()
                .HasForeignKey(c => c.LecturaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación con Estudiante
            entity.HasOne(c => c.Estudiante)
                .WithMany()
                .HasForeignKey(c => c.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación 1:N con Preguntas
            entity.HasMany(c => c.Preguntas)
                .WithOne(p => p.Cuestionario)
                .HasForeignKey(p => p.CuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación 1:1 con Resultado (opcional)
            entity.HasOne(c => c.Resultado)
                .WithOne(r => r.Cuestionario)
                .HasForeignKey<ResultadoCuestionario>(r => r.CuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índices
            entity.HasIndex(e => e.EstudianteId);
            entity.HasIndex(e => e.Estado);
        });

        // Configuración Pregunta
        modelBuilder.Entity<Pregunta>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Orden).IsRequired();
            entity.Property(e => e.Tipo).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Formato).IsRequired().HasMaxLength(20);
            entity.Property(e => e.TextoPregunta).IsRequired();
            entity.Property(e => e.Opciones).HasMaxLength(1000);
            entity.Property(e => e.RespuestaCorrecta).HasMaxLength(500);
            entity.Property(e => e.Explicacion).HasMaxLength(1000);

            // Relación 1:1 con RespuestaEstudiante (opcional)
            entity.HasOne(p => p.Respuesta)
                .WithOne(r => r.Pregunta)
                .HasForeignKey<RespuestaEstudiante>(r => r.PreguntaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índices
            entity.HasIndex(e => new { e.CuestionarioId, e.Orden }).IsUnique();
        });

        // Configuración RespuestaEstudiante
        modelBuilder.Entity<RespuestaEstudiante>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TextoRespuesta).IsRequired();
            entity.Property(e => e.FechaRespuesta).IsRequired();
            entity.Property(e => e.RetroalimentacionIA).HasMaxLength(1000);

            // Relación con Estudiante
            entity.HasOne(r => r.Estudiante)
                .WithMany()
                .HasForeignKey(r => r.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            entity.HasIndex(e => e.PreguntaId);
            entity.HasIndex(e => e.EstudianteId);
        });

        // Configuración ResultadoCuestionario
        modelBuilder.Entity<ResultadoCuestionario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FechaEvaluacion).IsRequired();
            entity.Property(e => e.PuntajeTotal).IsRequired();
            entity.Property(e => e.Porcentaje).IsRequired().HasPrecision(5, 2);
            entity.Property(e => e.PuntajeCriticas).HasPrecision(3, 2);
            entity.Property(e => e.RetroalimentacionPersonalizada).IsRequired();
            entity.Property(e => e.MensajeAnimo).HasMaxLength(500);
            entity.Property(e => e.NivelAnterior).HasMaxLength(20);
            entity.Property(e => e.NivelNuevo).HasMaxLength(20);
            entity.Property(e => e.AccionNivel).HasMaxLength(20);
            entity.Property(e => e.MensajeAdaptacion).HasMaxLength(500);

            // Relación con Estudiante
            entity.HasOne(r => r.Estudiante)
                .WithMany()
                .HasForeignKey(r => r.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            entity.HasIndex(e => e.EstudianteId);
            entity.HasIndex(e => e.FechaEvaluacion);
        });

        // ===== CU-008: SISTEMA DE AULAS Y VINCULACIÓN =====
        
        // Configuración Aula
        modelBuilder.Entity<Aula>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.CodigoVinculacion).IsRequired().HasMaxLength(10);
            entity.Property(e => e.FechaCreacion).IsRequired();
            entity.Property(e => e.Activa).IsRequired();

            // Relación con Docente
            entity.HasOne(a => a.Docente)
                .WithMany()
                .HasForeignKey(a => a.DocenteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índice único para código de vinculación
            entity.HasIndex(e => e.CodigoVinculacion).IsUnique();
            entity.HasIndex(e => e.DocenteId);
        });

        // Configuración EstudianteAula (Tabla intermedia)
        modelBuilder.Entity<EstudianteAula>(entity =>
        {
            // Clave compuesta
            entity.HasKey(ea => new { ea.EstudianteId, ea.AulaId });
            
            entity.Property(e => e.FechaVinculacion).IsRequired();
            entity.Property(e => e.Activo).IsRequired();

            // Relación con Estudiante
            entity.HasOne(ea => ea.Estudiante)
                .WithMany()
                .HasForeignKey(ea => ea.EstudianteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación con Aula
            entity.HasOne(ea => ea.Aula)
                .WithMany(a => a.Estudiantes)
                .HasForeignKey(ea => ea.AulaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            entity.HasIndex(e => e.EstudianteId);
            entity.HasIndex(e => e.AulaId);
            entity.HasIndex(e => new { e.EstudianteId, e.Activo });
        });

        // ===== CU-013: SISTEMA DE EXÁMENES GRUPALES =====
        
        // Configuración ExamenGrupal
        modelBuilder.Entity<ExamenGrupal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Descripcion).HasMaxLength(1000);
            entity.Property(e => e.LongitudTexto).IsRequired().HasMaxLength(20);
            entity.Property(e => e.GradoEscolar).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Complejidad).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FechaCreacion).IsRequired();
            entity.Property(e => e.Publicado).IsRequired();
            entity.Property(e => e.Activo).IsRequired();

            // Relación con Aula
            entity.HasOne(e => e.Aula)
                .WithMany()
                .HasForeignKey(e => e.AulaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación con Docente
            entity.HasOne(e => e.Docente)
                .WithMany()
                .HasForeignKey(e => e.DocenteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación con Lectura
            entity.HasOne(e => e.Lectura)
                .WithMany()
                .HasForeignKey(e => e.LecturaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            entity.HasIndex(e => e.AulaId);
            entity.HasIndex(e => e.DocenteId);
            entity.HasIndex(e => new { e.AulaId, e.Publicado, e.Activo });
        });

        // Configuración AsignacionExamen
        modelBuilder.Entity<AsignacionExamen>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Estado).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FechaAsignacion).IsRequired();
            entity.Property(e => e.Calificacion).HasPrecision(4, 2);

            // Relación con ExamenGrupal
            entity.HasOne(a => a.ExamenGrupal)
                .WithMany(e => e.Asignaciones)
                .HasForeignKey(a => a.ExamenGrupalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación con Estudiante
            entity.HasOne(a => a.Estudiante)
                .WithMany()
                .HasForeignKey(a => a.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación con SesionLectura (opcional)
            entity.HasOne(a => a.SesionLectura)
                .WithMany()
                .HasForeignKey(a => a.SesionLecturaId)
                .OnDelete(DeleteBehavior.SetNull);

            // Índices
            entity.HasIndex(e => new { e.ExamenGrupalId, e.EstudianteId }).IsUnique();
            entity.HasIndex(e => e.EstudianteId);
            entity.HasIndex(e => new { e.EstudianteId, e.Estado });
        });
    }
}
