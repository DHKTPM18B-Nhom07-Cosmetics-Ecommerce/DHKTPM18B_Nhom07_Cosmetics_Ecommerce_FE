// src/components/admin/AdminLayout.jsx

import { Outlet } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import HeaderNavbar from './HeaderNavbar'



export default function AdminLayout() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNavbar/>
      {/* BREADCRUMB */}
      <div className="bg-white border-b px-6 py-4 mt-16">
        <div className="text-sm text-gray-600">
          {pathnames.map((name, index) => (
            <span key={index}>
              {index > 0 && " > "}
              <span
                className={
                  index === pathnames.length - 1
                    ? "text-gray-900 font-medium"
                    : ""
                }
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="pt-6 pb-12 px-6 mt-16">
        <Outlet />
      </main>
    </div>
  );
}
