# EBI Vila Paula - Documentation

Welcome to the documentation for **EBI Vila Paula**, a comprehensive system designed to manage users, children, attendances, and documents for the EBI project.

This documentation is structured to help you understand the architecture, API, and frontend implementation.

## Overview

The system provides crucial functionality around the safe administration of children in EBI:

-   **User Roles**: Separation of concerns between Administrator, Coordenadora, and Colaboradora.
-   **Attendance Tracking**: Precise control of check-ins and check-outs, generating unique PINs for safety.
-   **Dynamic Reporting**: Comprehensive analytics and reporting for event days.
-   **Meta WhatsApp API**: Integration to send check-in PINs to parents/guardians directly via WhatsApp.
-   **Multi-Platform Access**: Seamless use across mobile and desktop.

## Quick Links

- [System Architecture](architecture.md)
- [Backend (FastAPI)](backend.md)
- [Frontend (React)](frontend.md)
- [Deployment & Setup](deployment.md)

## Tech Stack

This project is built using a modern, decoupled tech stack:

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker & Docker Compose.
