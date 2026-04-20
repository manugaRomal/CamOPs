# CamOPs Backend Setup

This backend now uses **MySQL** instead of SQL Server. The Spring Boot connection settings are in `src/main/resources/application.properties` and are currently hardcoded for local development, so each team member should update them on their own machine before running the app.

## Prerequisites

- Java 17
- Maven 3.9+ or the included Maven Wrapper
- MySQL 8.x
- A MySQL client such as MySQL Workbench, DBeaver, or the MySQL CLI

## 1. Create the database

Start MySQL and create the database used by the app:

```sql
CREATE DATABASE camops_db;
```

If you want to make the setup repeatable, you can use:

```sql
CREATE DATABASE IF NOT EXISTS camops_db;
```

## 2. Create or choose a MySQL user

You can use your existing MySQL account or create a dedicated one for the project.

Example:

```sql
CREATE USER 'camops_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON camops_db.* TO 'camops_user'@'localhost';
FLUSH PRIVILEGES;
```

If you use `root`, make sure the password matches your local MySQL installation.

## 3. Update `application.properties`

Open `src/main/resources/application.properties` and replace the values with your local MySQL details:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/camops_db?serverTimezone=UTC
spring.datasource.username=camops_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Notes:

- `camops_db` is the database name expected by the backend.
- `spring.jpa.hibernate.ddl-auto=update` lets Hibernate create and update tables automatically during development.
- If your MySQL server is running on a different host or port, update the JDBC URL accordingly.

## 4. Run the backend

From the `backend` folder, start the application with one of these commands:

```powershell
.\mvnw.cmd spring-boot:run
```

or, if Maven is installed globally:

```powershell
mvn spring-boot:run
```

## 5. Common connection issues

- `Access denied for user`: the username or password in `application.properties` is wrong.
- `Connection refused`: MySQL is not running, or the host/port in the JDBC URL is incorrect.
- `Unknown database 'camops_db'`: create the database first.
- `Public Key Retrieval is not allowed`: add `allowPublicKeyRetrieval=true` to the JDBC URL if your MySQL setup requires it.

Example URL if needed:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/camops_db?serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false
```

## 6. Recommended team workflow

- Do not commit personal MySQL passwords.
- Each developer should keep their own local `application.properties` values.
- If you want to share defaults safely, move secrets into environment variables later.

## Current dependency

The backend already includes the MySQL JDBC driver in `pom.xml`:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```
