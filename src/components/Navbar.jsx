export default function Navbar() {
    return (
      <nav className="bg-white border-b shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-green-700">PenDen.com</h1>
          {/* <button className="bg-gray-100 px-3 py-1 rounded-md">Shop by Department ▾</button> */}
        </div>
  
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full border rounded-md px-4 py-2"
          />
        </div>
  
        <div className="flex items-center space-x-4">
          <button>Login</button>
          <button>Register</button>
          <button className="bg-green-600 text-white px-3 py-2 rounded-md">
            🛒 0
          </button>
        </div>
      </nav>
    );
  }
  