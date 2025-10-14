export default function BrandCarousel() {
    const brands = [
    
      { name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
      { name: "Reebok", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg" }
    ];
  
    return (
      <div className="mt-6 bg-white rounded-md p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Featured Brands</h3>
        <div className="flex justify-around items-center">
          {brands.map((b, i) => (
            <img key={i} src={b.logo} alt={b.name} className="h-10" />
          ))}
        </div>
      </div>
    );
  }
  