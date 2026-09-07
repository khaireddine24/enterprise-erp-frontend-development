# Enterprise ERP Frontend

A modern, scalable and production-oriented **Enterprise Resource Planning (ERP) frontend** built with **React, TypeScript and Vite**.

The application follows a modular **feature-based architecture** designed for maintainability, scalability and enterprise applications. It includes custom reusable UI components, centralized state management, API services, permissions/RBAC, reusable hooks, utilities and multiple ERP business modules.

---

## ✨ Features

### 📊 Dashboard

* Business overview
* KPI cards
* Revenue and performance statistics
* Charts and analytical widgets
* Recent activities
* Notifications
* Quick actions
* Business performance indicators

### 👥 CRM

* Customer management
* Contact management
* Customer profiles
* Customer status
* Customer activity
* Customer segmentation
* CRM statistics

### 💰 Sales

* Sales management
* Quotations
* Orders
* Invoices
* Customers
* Sales tracking
* Sales statistics
* Order status management

### 🛒 Purchases

* Supplier management
* Purchase orders
* Purchase tracking
* Supplier information
* Purchase statistics
* Procurement workflow

### 📦 Inventory

* Product management
* Stock management
* Warehouses
* Categories
* Stock movements
* Inventory statistics
* Low-stock monitoring

### 🧾 Accounting

* Financial overview
* Transactions
* Invoices
* Expenses
* Revenue
* Accounting statistics
* Financial reporting

### 👨‍💼 Human Resources

* Employee management
* Departments
* Positions
* Attendance
* Leave management
* HR statistics
* Employee profiles

### 📁 Projects

* Project management
* Project status
* Tasks
* Team members
* Progress tracking
* Project statistics

### 🏢 Assets

* Asset management
* Asset categories
* Asset status
* Assignment tracking
* Asset information

### 📄 Documents

* Document management
* Document categories
* Document status
* Document organization
* Document workflows

### 📈 Reports

* Business reports
* Sales reports
* Financial reports
* Inventory reports
* HR reports
* Project reports
* Data visualization

### 🔔 Notifications & Workflows

* Notifications
* Workflow management
* Status tracking
* User alerts
* System feedback

### ⚙️ Settings

* Application settings
* User preferences
* System configuration
* ERP configuration

---

# 🏗️ Architecture

The project uses a **feature-based modular architecture** combined with shared infrastructure.

```text
src/
├── app/
│   ├── guards.tsx
│   └── router.tsx
│
├── components/
│   ├── charts/
│   │   └── widgets.tsx
│   ├── common/
│   │   ├── crud.tsx
│   │   ├── DataTable.tsx
│   │   └── feedback.tsx
│   └── ui/
│       └── primitives.tsx
│
├── constants/
│   └── app.ts
│
├── features/
│   ├── accounting/
│   │   └── AccountingPages.tsx
│   ├── assets/
│   │   └── AssetPages.tsx
│   ├── auth/
│   │   └── pages.tsx
│   ├── crm/
│   │   └── CrmPages.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── documents/
│   │   └── DocumentPages.tsx
│   ├── hr/
│   │   └── HrPages.tsx
│   ├── inventory/
│   │   └── InventoryPages.tsx
│   ├── notifications/
│   │   └── WorkflowPages.tsx
│   ├── projects/
│   │   └── ProjectPages.tsx
│   ├── purchases/
│   │   └── PurchasePages.tsx
│   ├── reports/
│   │   └── ReportPages.tsx
│   ├── sales/
│   │   └── SalesPages.tsx
│   └── settings/
│       └── SettingsPages.tsx
│
├── hooks/
│   ├── core.ts
│   └── queries.ts
│
├── layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
│
├── lib/
│   ├── api-client.ts
│   └── permissions.ts
│
├── mocks/
│   └── data.ts
│
├── pages/
│   └── errors.tsx
│
├── services/
│   └── erp.service.ts
│
├── stores/
│   ├── auth.store.ts
│   ├── notification.store.ts
│   ├── toast.store.ts
│   └── ui.store.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── cn.ts
│   ├── format.ts
│   └── helpers.ts
│
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

---

# 🧩 Architecture Responsibilities

## `app/`

Application-level infrastructure.

```text
app/
├── guards.tsx
└── router.tsx
```

### `guards.tsx`

Responsible for:

* Authentication guards
* Authorization checks
* Protected routes
* Permission-based access

### `router.tsx`

Responsible for:

* Application routing
* Feature routes
* Nested routes
* Error routes
* Protected navigation

---

# 🎨 Components

The application uses a **custom reusable UI/component system** rather than relying on a standard component library.

```text
components/
├── charts/
├── common/
└── ui/
```

## `components/ui`

Contains reusable low-level UI primitives.

```text
ui/
└── primitives.tsx
```

These primitives provide the foundation for the application's visual system.

Examples include:

* Buttons
* Inputs
* Cards
* Badges
* Dialogs
* Dropdowns
* Select components
* Form elements
* Layout primitives

---

## `components/common`

Contains reusable business-agnostic components.

```text
common/
├── crud.tsx
├── DataTable.tsx
└── feedback.tsx
```

### DataTable

Reusable enterprise table supporting concepts such as:

* Sorting
* Pagination
* Searching
* Filtering
* Row actions
* Empty states
* Loading states
* Responsive behavior
* Data presentation

### CRUD

Reusable patterns for:

* Create
* Read
* Update
* Delete
* Confirmation
* Form workflows

### Feedback

Centralized UI feedback:

* Loading states
* Empty states
* Error states
* Success states
* Alerts
* Toast feedback

---

# 📊 Charts

```text
components/charts/
└── widgets.tsx
```

Reusable dashboard visualization components for:

* KPI widgets
* Revenue charts
* Sales analytics
* Inventory statistics
* Business metrics
* Performance indicators

---

# 📌 Constants

```text
constants/
└── app.ts
```

Centralized application constants prevent duplicated magic values throughout the project.

Examples:

```text
Application configuration
Route-related constants
Status values
Pagination configuration
UI configuration
Business configuration
Default values
```

Keeping constants centralized makes the application easier to maintain and modify.

---

# 🧱 Features

Each ERP domain is isolated inside `features/`.

```text
features/
├── accounting/
├── assets/
├── auth/
├── crm/
├── dashboard/
├── documents/
├── hr/
├── inventory/
├── notifications/
├── projects/
├── purchases/
├── reports/
├── sales/
└── settings/
```

This approach keeps business functionality separated and allows individual modules to evolve independently.

### Example

```text
features/
└── sales/
    └── SalesPages.tsx
```

The same structure is applied across the ERP domains.

---

# 🪝 Hooks

```text
hooks/
├── core.ts
└── queries.ts
```

Reusable React logic is centralized inside custom hooks.

Responsibilities include:

* Authentication logic
* UI behavior
* Query logic
* Data fetching
* Mutations
* Reusable application behavior
* Shared state interactions

The goal is to keep UI components focused on presentation rather than complex application logic.

---

# 🌐 API & Infrastructure

```text
lib/
├── api-client.ts
└── permissions.ts
```

## API Client

`api-client.ts` centralizes communication with the backend.

Responsibilities include:

* HTTP requests
* Request configuration
* API base URL
* Error handling
* Response handling
* Authentication integration

---

## Permissions

`permissions.ts` centralizes authorization logic.

The application can use permission-based access control such as:

```text
dashboard.view
customers.view
customers.create
customers.update
sales.view
sales.create
sales.update
inventory.view
inventory.manage
accounting.view
reports.view
settings.manage
```

This allows the frontend to adapt the interface according to the authenticated user's permissions.

---

# 🔐 Authentication & Authorization

Authentication is integrated into the application routing and state architecture.

```text
Authentication
      ↓
Auth Store
      ↓
Route Guards
      ↓
Permission Check
      ↓
Protected Feature
```

The architecture supports:

* Authentication state
* Protected routes
* Role-based access
* Permission-based access
* Unauthorized states
* Session-aware navigation

---

# 🗄️ Services

```text
services/
└── erp.service.ts
```

The service layer separates business/API operations from presentation components.

Example responsibilities:

```text
Customers
Sales
Purchases
Inventory
Accounting
HR
Projects
Reports
Documents
```

This prevents components from directly handling API implementation details.

---

# 🧠 State Management

Global application state is separated from server/API concerns.

```text
stores/
├── auth.store.ts
├── notification.store.ts
├── toast.store.ts
└── ui.store.ts
```

### Auth Store

Manages:

* Current user
* Authentication state
* Session-related information

### Notification Store

Manages:

* Notifications
* Read/unread state
* Notification UI state

### Toast Store

Manages:

* Success messages
* Error messages
* Warning messages
* Informational messages

### UI Store

Manages:

* Sidebar state
* Theme/UI preferences
* Layout state
* Global interface behavior

---

# 🧰 Utilities

```text
utils/
├── cn.ts
├── format.ts
└── helpers.ts
```

Reusable utility functions are centralized here.

Examples:

* Class name composition
* Currency formatting
* Date formatting
* Number formatting
* String helpers
* Data transformation
* Common application helpers

The objective is to avoid duplicating generic logic throughout feature modules.

---

# 📝 Types

```text
types/
└── index.ts
```

Centralized TypeScript definitions provide consistent typing across the application.

Examples:

```text
User
Customer
Product
Order
Invoice
Employee
Project
Asset
Document
Notification
Report
API responses
```

Strong typing improves:

* Developer experience
* Maintainability
* Refactoring
* API integration
* Runtime safety

---

# 🧪 Mock Data

```text
mocks/
└── data.ts
```

Mock data is used during frontend development when backend endpoints are unavailable or when isolated UI development is required.

This makes it easier to:

* Prototype features
* Develop components
* Test dashboards
* Demonstrate ERP workflows
* Develop independently from the backend

---

# 🖥️ Layouts

```text
layouts/
├── AuthLayout.tsx
└── DashboardLayout.tsx
```

## AuthLayout

Used for authentication-related pages:

* Login
* Registration
* Authentication screens
* Password-related flows

## DashboardLayout

Provides the main ERP application shell:

* Sidebar
* Header
* Navigation
* Main content
* Notifications
* User menu
* Responsive dashboard layout

---

# 🚦 Application Flow

The architecture follows a clear separation of responsibilities:

```text
User
 │
 ▼
Page / Feature
 │
 ▼
Custom Hook
 │
 ▼
Service
 │
 ▼
API Client
 │
 ▼
Backend API
```

For authorization:

```text
User
 │
 ▼
Router
 │
 ▼
Route Guard
 │
 ▼
Permission Check
 │
 ▼
Feature
```

This structure keeps business logic, API communication, state and presentation clearly separated.

---

# 🎨 UI & UX

The frontend focuses on an enterprise dashboard experience.

### Design principles

* Clean interface
* Consistent spacing
* Reusable components
* Responsive layouts
* Clear information hierarchy
* Accessible interactions
* Consistent feedback
* Professional dashboard experience

### Responsive support

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

---

# 🌙 UI System

The project uses a **custom UI system** based on reusable primitives and shared components.

```text
Custom UI Primitives
        ↓
Common Components
        ↓
Feature Components
        ↓
ERP Pages
```

This makes it possible to maintain a consistent visual language without coupling the application to a specific external component library.

---

# 🛡️ Enterprise Considerations

The architecture is designed with enterprise applications in mind.

### Security

* Protected routes
* Permission checks
* Centralized authentication state
* API abstraction
* Controlled UI access

### Maintainability

* Feature-based organization
* Reusable components
* Centralized utilities
* Centralized constants
* Typed services
* Custom hooks

### Scalability

New ERP modules can be added without restructuring the entire application.

For example:

```text
features/
├── ecommerce/
├── manufacturing/
├── payroll/
├── logistics/
└── procurement/
```

---

# ⚡ Performance

The architecture is designed to support:

* Lazy-loaded routes
* Component reuse
* Efficient rendering
* Optimized API communication
* Reusable data-fetching logic
* Modular feature loading
* Minimal duplication

---

# 🧪 Testing Strategy

Recommended testing layers:

```text
Unit Tests
    ↓
Component Tests
    ↓
Feature Tests
    ↓
Integration Tests
    ↓
End-to-End Tests
```

Important areas to test:

* Authentication
* Route guards
* Permissions
* CRUD operations
* Forms
* Tables
* Services
* State management
* Critical ERP workflows

---

# 🛠️ Tech Stack

| Technology           | Purpose                      |
| -------------------- | ---------------------------- |
| React                | Frontend framework           |
| TypeScript           | Type safety                  |
| Vite                 | Development & build tooling  |
| CSS                  | Application styling          |
| React Router         | Routing                      |
| Zustand              | Client-side state management |
| API Client           | Backend communication        |
| Custom UI Components | Reusable interface system    |
| Chart Library        | Data visualization           |
| ESLint               | Code quality                 |
| Prettier             | Code formatting              |

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/erp-frontend.git
```

Navigate to the project:

```bash
cd erp-frontend
```

Install dependencies:

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_APP_NAME=Enterprise ERP
VITE_API_URL=http://localhost:3000/api
```

Additional environment variables can be added according to the backend/API configuration.

---

# 🚀 Development

Start the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

---

# 📁 Project Organization Principles

The project follows several architectural rules:

### 1. Feature-first organization

Business functionality belongs inside `features/`.

### 2. Shared components

Generic reusable UI belongs inside `components/`.

### 3. Business logic

Reusable application/business operations belong inside hooks and services.

### 4. API communication

Backend communication is centralized through the API client and services.

### 5. Global state

Only genuinely global client state should be stored inside Zustand stores.

### 6. Utilities

Generic reusable functions belong inside `utils/`.

### 7. Constants

Shared application constants belong inside `constants/`.

### 8. Types

Reusable TypeScript models belong inside `types/`.

---

# 🗺️ Roadmap

* [x] ERP dashboard
* [x] Authentication architecture
* [x] Route protection
* [x] Permission system
* [x] Custom UI primitives
* [x] Reusable DataTable
* [x] CRUD architecture
* [x] CRM
* [x] Sales
* [x] Purchases
* [x] Inventory
* [x] Accounting
* [x] HR
* [x] Projects
* [x] Assets
* [x] Documents
* [x] Reports
* [x] Notifications
* [x] Settings
* [ ] Advanced analytics
* [ ] Audit logs
* [ ] Multi-company support
* [ ] Multi-branch support
* [ ] Multi-currency support
* [ ] Advanced workflow automation
* [ ] Real-time notifications
* [ ] Advanced reporting
* [ ] AI-powered ERP features

---

# 🔮 Future Architecture

The project can evolve toward a complete enterprise platform with:

* Multi-company ERP
* Multi-branch management
* Multi-currency
* Multi-language support
* Advanced RBAC
* Audit trails
* Approval workflows
* Real-time updates
* Advanced business intelligence
* Automated workflows
* External integrations
* AI-assisted business analytics

---

# 🤝 Contributing

Contributions are welcome.

Before submitting a pull request:

1. Create a feature branch.
2. Follow the existing architecture.
3. Keep business logic inside the appropriate feature.
4. Reuse existing components and utilities.
5. Keep TypeScript types explicit.
6. Run linting and tests.
7. Submit a clear pull request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Khaireddine Ihrissane**

Full Stack Developer specialized in:

* React
* TypeScript
* JavaScript
* Node.js
* Next.js
* Vite
* Modern Web Development

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
