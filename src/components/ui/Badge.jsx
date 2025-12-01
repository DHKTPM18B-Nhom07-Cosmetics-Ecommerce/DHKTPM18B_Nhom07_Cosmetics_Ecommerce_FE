export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
    blue: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`px-4 py-2 text-xs font-medium rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}