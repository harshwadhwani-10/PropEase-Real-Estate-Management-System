import { useState } from "react";
import { FaCalculator, FaRupeeSign, FaPercent, FaCalendarAlt } from "react-icons/fa";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [tenureType, setTenureType] = useState("years");
  const [results, setResults] = useState(null);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    let months = parseFloat(loanTenure);
    
    if (tenureType === "years") {
      months = months * 12;
    }

    if (principal > 0 && rate > 0 && months > 0) {
      const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalAmount = emi * months;
      const totalInterest = totalAmount - principal;

      setResults({
        emi: emi.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        principal: principal.toFixed(2),
      });
    } else {
      setResults(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateEMI();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaCalculator className="text-4xl text-slate-700" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              EMI Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Calculate your monthly home loan installments easily
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Loan Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRupeeSign className="inline mr-1" />
                  Loan Amount
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Enter loan amount"
                  min="0"
                  step="1000"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the principal amount you want to borrow
                </p>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPercent className="inline mr-1" />
                  Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="Enter interest rate"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the annual interest rate percentage
                </p>
              </div>

              {/* Loan Tenure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-1" />
                  Loan Tenure
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    placeholder="Enter tenure"
                    min="1"
                    step="1"
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    required
                  />
                  <select
                    value={tenureType}
                    onChange={(e) => setTenureType(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the loan repayment period
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                <FaCalculator />
                Calculate EMI
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Results</h2>
            {results ? (
              <div className="space-y-4">
                {/* EMI */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                  <p className="text-3xl font-bold text-green-700">
                    {formatCurrency(results.emi)}
                  </p>
                </div>

                {/* Total Amount */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Total Amount Payable</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(results.totalAmount)}
                  </p>
                </div>

                {/* Total Interest */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(results.totalInterest)}
                  </p>
                </div>

                {/* Principal */}
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                  <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
                  <p className="text-xl font-semibold text-gray-700">
                    {formatCurrency(results.principal)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Payment Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Principal:</span>
                      <span className="font-semibold">{formatCurrency(results.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest:</span>
                      <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-800 font-semibold">Total:</span>
                      <span className="text-gray-800 font-bold">{formatCurrency(results.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaCalculator className="text-5xl mx-auto mb-4 opacity-30" />
                <p>Enter loan details and click "Calculate EMI" to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About EMI Calculator</h2>
          <div className="space-y-3 text-gray-600 text-sm">
            <p>
              <strong>EMI (Equated Monthly Installment)</strong> is a fixed payment amount made by
              a borrower to a lender at a specified date each calendar month.
            </p>
            <p>
              This calculator helps you estimate your monthly home loan installments based on the
              loan amount, interest rate, and tenure. The results show:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Monthly EMI amount you need to pay</li>
              <li>Total amount payable over the loan tenure</li>
              <li>Total interest you will pay</li>
              <li>Principal amount breakdown</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              <strong>Note:</strong> This is an estimate. Actual EMI may vary based on the lender's
              terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

