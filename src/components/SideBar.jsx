export default function Sidebar() {
    const categories = [
      "Frames", "Stationaries", "Printing", "Woods",
      "Books", "Mirrors", "Electronics"
    ];
  
    return (
      <aside className="w-60 bg-white border-r p-4">
        <h3 className="font-semibold mb-3">Shop by Department</h3>
        <ul className="space-y-2 text-sm">
          {categories.map((cat, i) => (
            <li key={i} className="cursor-pointer hover:text-blue-700">{cat}</li>
          ))}
        </ul>
      </aside>
    );
  }
  