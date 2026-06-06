# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["LecturaIA.API.csproj", "./"]
RUN dotnet restore "LecturaIA.API.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "LecturaIA.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "LecturaIA.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Expose port
EXPOSE 5000

# Copy published app
COPY --from=publish /app/publish .

# Create directory for generated images (will be mounted as volume)
RUN mkdir -p /app/wwwroot/images/lecturas && \
    chmod -R 755 /app/wwwroot

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "LecturaIA.API.dll"]
