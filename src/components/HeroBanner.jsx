export default function HeroBanner() {
  return (
    <div
      className="text-white rounded-md flex justify-between items-center p-6"
      style={{ backgroundColor: "#969195" }}
    >
      <div>
        <h2 className="text-3xl font-bold">PenDen.credit</h2>
        <p className="text-lg mt-2">Shop now, pay later</p>

        <button
          className="mt-4 px-4 py-2 rounded-md font-semibold"
          style={{
            backgroundColor: "white",
            color: "#969195",
          }}
        >
          Apply now
        </button>
      </div>

      <img
        // src="https://static.penden.com/images/banners/penden-credit-banner.webp"
        // alt="Promo"
        // className="w-72 rounded-md"
      />
    </div>
  );
}
