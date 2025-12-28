FROM maven:3.9.3-eclipse-temurin-22-jdk AS build

# Set working directory inside the container
WORKDIR /app

# Copy pom.xml first to leverage Docker cache
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the project (package jar)
RUN mvn clean package -DskipTests

# Use a lightweight JDK runtime image for the final artifact
FROM eclipse-temurin:22-jre

# Set working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app uses
EXPOSE 8080

# Command to run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]