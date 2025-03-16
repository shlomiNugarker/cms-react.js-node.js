import React from "react";
import { Link } from "react-router";

const Dashboard: React.FC = () => {
  return (
    <div className="p-4 space-y-4 flex flex-col items-center justify-center text-center">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <Link to={"/"} className="underline">
        Go to Home
      </Link>
    </div>
  );
};

export default Dashboard;
