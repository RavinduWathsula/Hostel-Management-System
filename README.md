# AEGIS - Advanced Hostel Management System

![AEGIS Dashboard Mockup](https://via.placeholder.com/1000x500.png?text=AEGIS+Hostel+Management+System) <!-- Replace with actual screenshot -->

AEGIS is a modern, comprehensive, and aesthetically stunning Hostel Management System. Built with a focus on real-time operational efficiency and premium user experience, AEGIS allows administrators to seamlessly manage everything from resident allocations and fee collections to maintenance complaints and staff tracking.

## 🚀 Key Features

*   📊 **Real-Time Executive Dashboard**: Get an immediate overview of active residents, occupied beds, monthly revenue, and pending issues with beautiful KPI metric cards.
*   📈 **Advanced System Analytics**: A dedicated, interactive analytics engine featuring:
    *   Revenue Trends (Line Charts)
    *   Revenue by Payment Method (Doughnut Charts)
    *   Hostel Occupancy vs Capacity (Bar Charts)
    *   Complaints Breakdown (Doughnut Charts)
*   🛏️ **Room & Allocation Management**: Easily visualize room capacities, assign beds, and handle room transfers.
*   👥 **Comprehensive Directories**: Manage detailed profiles for Students/Residents and Staff members.
*   💳 **Fee Management**: Log monthly fee payments, track payment methods, and monitor total revenue collection.
*   🛠️ **Service & Complaints Desk**: Residents can log issues (Electrical, Plumbing, Security), and administrators can track them through to resolution.
*   📅 **Leave & Attendance Tracking**: Monitor daily resident attendance and manage official leave applications.
*   📝 **Visitors Log**: Keep track of guests entering and leaving the premises for enhanced security.
*   🌓 **Dark/Light Mode**: Fully responsive, beautifully designed themes that adapt to user preference.

## 💻 Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS
*   **Icons & UI Components**: Lucide-React, Glassmorphism design principles
*   **Data Visualization**: Chart.js, react-chartjs-2
*   **Backend/Database**: Express.js (Node.js), MySQL
*   **Routing**: React Router (or Conditional State Routing)

## 🛠️ Installation & Setup

Follow these steps to get the project running on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MySQL](https://www.mysql.com/) Server

### 2. Clone the Repository
```bash
git clone https://github.com/RavinduWathsula/Hostel-Management-System.git
cd Hostel-Management-System
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Configuration
1. Open your MySQL client.
2. Execute the `schema.sql` file provided in the repository to set up the required tables and initial seed data.
3. If you have an environment file (e.g., `.env`), make sure to configure your database connection string, user, and password accordingly.

### 5. Running the Application

**To run the development server (Frontend + Backend concurrently):**
```bash
npm run dev
```

*(This will typically start your Vite frontend server and your Express backend server simultaneously, allowing them to communicate).*

**Alternative Scripts:**
*   `npm run start`: Starts the production Node server.
*   `npm run build`: Builds the React frontend for production.
*   `npm run server`: Starts the backend server using Nodemon (for backend development).

## 💡 What Makes AEGIS Special?

*   **Premium UI/UX**: Designed with a massive emphasis on aesthetics. From micro-animations and glowing gradient orbs to frosted glass (glassmorphism) cards, AEGIS looks and feels like a state-of-the-art SaaS product.
*   **Live Data Syncing**: Changes made in the system (like adding a payment or allocating a room) instantly reflect across the entire application, including the Analytics and Dashboard summaries.
*   **Smart Analytics**: Built-in intelligence that automatically categorizes data and presents it in easy-to-read, beautifully styled charts.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
