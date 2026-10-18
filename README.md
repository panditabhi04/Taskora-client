# Taskora – Employee & Task Management System

## Project Overview

Taskora is a MERN Stack application for managing employees and their tasks. It allows users to create and manage employee records, assign tasks, track task progress, and view task summaries.

### Tech Stack

- **Frontend:** React.js, Redux Toolkit, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose

## Setup Instructions

### 1. Clone the repositories

Clone the frontend and backend repositories separately.

### 2. Install dependencies

Run the following command inside each project folder:

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend and frontend folders using the provided `.env.example` files.

Update the values according to your local setup.

### 4. Start the application

Start the backend:

```bash
npm run dev
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

Check each project's `package.json` for the available scripts.

## Environment Variables

### Backend

- `PORT`:  3000.
- `MONGODB_URL`:"mongodb+srv://abhishekpandit1104_db_user\:MY_DATA_BASE\_ PASSWORD\@taskoracluster.lqzov7t.mongodb.net/".

### Frontend

- `VITE_API_URL`: "[https://taskora-server-2.onrender.com/api](https://taskora-server-2.onrender.com/api)".

Never commit real passwords, database credentials, or other secrets to Git.

## API Overview

The backend provides APIs for employee and task management.

### Employee APIs

| Method | Endpoint            | Purpose                       |
| ------ | ------------------- | ----------------------------- |
| GET    | `/api/employee`     | Get employees with pagination |
| POST   | `/api/employee`     | Create an employee            |
| GET    | `/api/employee/:id` | Get an employee by ID         |
| PUT    | `/api/employee/:id` | Update an employee            |
| DELETE | `/api/employee/:id` | Delete an employee if allowed |

### Task APIs

| Method | Endpoint                | Purpose                           |
| ------ | ----------------------- | --------------------------------- |
| GET    | `/api/tasks`            | Get tasks with search and filters |
| POST   | `/api/tasks`            | Create a task                     |
| GET    | `/api/tasks/:id`        | Get a task by ID                  |
| PUT    | `/api/tasks/:id`        | Update a task                     |
| PUT    | `/api/tasks/:id/status` | Update task status                |
| DELETE | `/api/tasks/:id`        | Delete a task if supported        |

*Note: Check these paths against the actual Express routes before submission.*

## Database Schema

### Employee

An employee contains:

- Employee ID (unique)
- Full Name
- Email (unique and normalized)
- Phone
- Department
- Role
- Joining Date
- Status: Active, Inactive, or On Leave
- Skills
- Leave Start Date and Leave End Date, when applicable

### Task

A task contains:

- Task ID
- Title and Description
- Assigned Employee
- Department
- Priority: Low, Medium, High, or Critical
- Status: Todo, In Progress, Completed, or Cancelled
- Start Date and Due Date
- Created Date and Completed Date

## Employee–Task Relationship

Each task references an employee using the employee's MongoDB ObjectId.

This relationship helps identify the employee responsible for a task and supports employee-based filtering and task validation.

Before assigning a task, the backend checks the employee's status and task capacity.

## Business Rules

- New tasks start with `Todo`.
- Only allowed status transitions are accepted by the backend.
- Completed and Cancelled tasks cannot be edited.
- The backend sets `Completed Date` when a task becomes Completed.
- Due Date cannot be earlier than Start Date.
- Only Active employees can receive tasks, except that employees on leave are also rejected when the task's Start Date falls within their leave period.
- An employee can have at most three active tasks (`Todo` and `In Progress`).

## Employee Deletion

Before deleting an employee, the backend checks whether the employee has active tasks.

If active tasks exist, deletion is rejected to prevent tasks from being left without a responsible employee. Otherwise, the employee can be deleted.

## Search, Filtering and Pagination

Filtering, sorting, search, and pagination are handled by the backend. This reduces unnecessary data transfer and works better as the number of records grows.

Filters are stored in URL query parameters so filtered results can be shared, bookmarked, and restored after refreshing the page.

## Status Transition Validation

Status transitions are validated in the backend service layer. This ensures that tasks follow the allowed status flow and prevents invalid changes, even when requests come from different clients.

## Assumptions

- Employee IDs and email addresses must be unique.
- Email addresses are normalized before saving.
- Only Active employees can be assigned tasks, subject to leave-date validation.
- A task is active when its status is `Todo` or `In Progress`.
- Completed and Cancelled are final statuses.
- Completed Date is managed by the backend, not supplied by the frontend.
- API routes and environment variable names must match the actual project configuration.

## Deployment

The backend is deployed on Render, and the frontend can be deployed on Vercel.

For production, set `VITE_API_URL` to the deployed backend API URL and configure the backend's database connection and CORS settings appropriately.



(1) where you validate status transitions and why?

Ans :- I validate status transitions in the backend service layer to ensure tasks follow the allowed status flow. This prevents invalid status changes and keeps the business rules consistent,even when requests come from different clients.

(2) why Completed Date comes from the backend?

Ans :- The backend sets the completed date when a task's status changes to Completed. This keeps the date accurate and prevents users from sending an incorrect completion date from the frontend.

(3) how you block inactive / on-leave assignment?

Ans :- I validate employee status in the backend before assigning a task. If an employee is inactive or on leave, the backend rejects the assignment to prevent tasks from being assigned to unavailable employees.

(4) why filtering and pagination are on the backend?

Ans :- I handle filtering and pagination on the backend to fetch only the required data from the database. This improves performance, reduces data transfer, and works efficiently when the number of records increases.

(5) why filters live in the URL?

Ans :- I store filters in the URL query parameters so users can share or bookmark filtered results. It also makes the filters easier to manage and keeps the page state consistent when refreshing the page.

(6) what can go wrong if two requests assign a 4th active task at the same time?

Ans :- I store filters in the URL query parameters so users can share or bookmark filtered results. It also makes the filters easier to manage and keeps the page state consistent when refreshing the page.
