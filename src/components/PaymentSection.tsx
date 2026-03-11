import { useState } from "react";
import { X } from "lucide-react";

interface PaymentSectionProps {
  product: any;
  onPaymentComplete: (cardDetails: any) => void;
  onClose: () => void;
}

interface FormData {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface FormErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export function PaymentSection({ product, onPaymentComplete, onClose }: PaymentSectionProps) {
  const [form, setForm] = useState<FormData>({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Extract price breakdown from product
  const priceSummaryHTML = product.price_breakdown?.priceSummaryHTML || '';
  const discountOfferHTML = product.price_breakdown?.discountOfferHTML || '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  }

  function validate() {
    const newErrors: FormErrors = {};

    if (!form.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    if (!form.expiry.trim()) newErrors.expiry = "Expiry date is required";
    if (!form.cvv.trim()) newErrors.cvv = "CVV is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handlePay() {
    if (!validate()) return;

    console.log("Processing payment", form);
    onPaymentComplete(form);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-6 flex gap-8 w-[900px] relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
        
        {/* PRODUCT INFO */}
        <div className="w-[350px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {product.product_name}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Account: {product.accounts?.name}
          </p>

          {/* PRICE BREAKDOWN */}
          <div className="border rounded-xl p-5 bg-gray-50">
            {priceSummaryHTML ? (
              <div 
                dangerouslySetInnerHTML={{ __html: priceSummaryHTML }}
                className="font-m"
              />
            ) : (
              <div className="text-gray-500">Price breakdown not available</div>
            )}

            {discountOfferHTML && (
              <div 
                dangerouslySetInnerHTML={{ __html: discountOfferHTML }}
                className="mt-2"
              />
            )}
          </div>
        </div>

        {/* CARD SECTION */}
        <div className="flex-1">

          <p className="text-sm text-gray-600 mb-4">
            Ensure your card supports online transactions.
          </p>

          {/* CARD NUMBER */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Card Number</label>
            <input
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className={`w-full mt-1 p-3 border rounded-lg outline-none ${
                errors.cardNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cardNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* EXPIRY + CVV */}
          <div className="flex gap-3 mb-5">

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Valid Thru</label>
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM / YY"
                className={`w-full mt-1 p-3 border rounded-lg outline-none ${
                  errors.expiry ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.expiry && (
                <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">CVV</label>
              <input
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="CVV"
                className={`w-full mt-1 p-3 border rounded-lg outline-none ${
                  errors.cvv ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.cvv && (
                <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
              )}
            </div>

          </div>

          <button
            onClick={handlePay}
            className="w-full bg-yellow-400 hover:bg-yellow-500 font-semibold py-3 rounded-lg"
          >
            Pay Now
          </button>

        </div>
      </div>
    </div>
  );
}
