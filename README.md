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
