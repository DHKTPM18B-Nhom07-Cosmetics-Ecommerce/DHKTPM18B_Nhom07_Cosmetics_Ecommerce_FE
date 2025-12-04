import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import HeaderNavbar from "./HeaderNavbar";

export default function AdminLayout() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="admin-layout min-h-screen bg-gray-100">
      <HeaderNavbar />

      <div className="bg-white border-b px-6 py-4">
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
      <main className="pt-6 pb-12 px-6">
        <Outlet />
      </main>
    </div>
  );
}
