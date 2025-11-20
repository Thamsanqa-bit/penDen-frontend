import API from "../services/api";

export default function PayButton({ amount }) {
  const handlePay = async () => {
    const res = await API.get(`/payments/create/?amount=${amount}`);
    window.location.href = res.data.payment_url; // redirect to PayFast
  };

  return (
    <button
      onClick={handlePay}
      className="bg-green-600 px-4 py-2 text-white rounded"
    >
      Pay with PayFast
    </button>
  );
}
