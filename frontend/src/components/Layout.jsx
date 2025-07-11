// src/components/Layout.jsx
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {children}
    </div>
  );
}
