'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingDown, Truck, Euro, Fuel, Clock } from 'lucide-react'

export default function SavingsCalculatorPage() {
  const [numTrucks, setNumTrucks] = useState(2)
  const [kmPerYear, setKmPerYear] = useState(100000)
  const [avgSpeed, setAvgSpeed] = useState(60)
  const [emptyPercent, setEmptyPercent] = useState(25)
  const [fuelConsumption, setFuelConsumption] = useState(25)
  const [fuelPrice, setFuelPrice] = useState(1.82)
  const [driverRate, setDriverRate] = useState(20)
  const [reductionPercent, setReductionPercent] = useState(5)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const calculateSavings = () => {
    const trucksPerKm = numTrucks * kmPerYear
    const totalEmptyRunning = (trucksPerKm * emptyPercent) / 100
    const totalFuelCost = (totalEmptyRunning / (100 / fuelConsumption)) * fuelPrice
    const totalSalaryCost = (totalEmptyRunning / avgSpeed) * driverRate
    const totalCosts = totalSalaryCost + totalFuelCost

    const percentRest = emptyPercent - reductionPercent
    const percentReduction = percentRest / 100
    const outcomeEmpty = kmPerYear * percentReduction * numTrucks
    const outcomeFuel = (outcomeEmpty / (100 / fuelConsumption)) * fuelPrice
    const outcomeSalary = (outcomeEmpty / avgSpeed) * driverRate
    const outcomeCosts = outcomeFuel + outcomeSalary

    return Math.round(totalCosts - outcomeCosts)
  }

  const savings = calculateSavings()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Calculate Your Potential Savings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how much you could save by reducing empty runs with our freight exchange platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Calculator Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Fleet Details</h2>

            {/* Number of Trucks */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How many trucks do you own/manage?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numTrucks}
                  onChange={(e) => setNumTrucks(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <span className="text-lg font-bold text-emerald-600 min-w-[3rem] text-right">
                  {numTrucks}
                </span>
              </div>
            </div>

            {/* Km per Year */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How many km does each truck travel per year?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="1000"
                  value={kmPerYear}
                  onChange={(e) => setKmPerYear(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <span className="text-lg font-bold text-emerald-600 min-w-[6rem] text-right">
                  {kmPerYear.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors mb-4"
            >
              {showAdvanced ? '▴' : '▾'} Advanced filters
            </button>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                {/* Average Speed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average speed of your trucks (km/h)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="30"
                      max="120"
                      value={avgSpeed}
                      onChange={(e) => setAvgSpeed(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[3rem] text-right">
                      {avgSpeed}
                    </span>
                  </div>
                </div>

                {/* Empty Running % */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Percentage of distance traveled empty (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={emptyPercent}
                      onChange={(e) => setEmptyPercent(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[3rem] text-right">
                      {emptyPercent}%
                    </span>
                  </div>
                </div>

                {/* Fuel Consumption */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel consumption per 100 km (liters)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={fuelConsumption}
                      onChange={(e) => setFuelConsumption(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[3rem] text-right">
                      {fuelConsumption}
                    </span>
                  </div>
                </div>

                {/* Fuel Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current fuel price per liter (€)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[4rem] text-right">
                      €{fuelPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Driver Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hourly rate for truck drivers (€)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={driverRate}
                      onChange={(e) => setDriverRate(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[4rem] text-right">
                      €{driverRate}
                    </span>
                  </div>
                </div>

                {/* Reduction % */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated reduction in empty runs (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={reductionPercent}
                      onChange={(e) => setReductionPercent(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-lg font-bold text-emerald-600 min-w-[3rem] text-right">
                      {reductionPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-2xl p-8 text-zinc-900">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Your Potential Savings</h2>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-5xl font-bold mb-2">
                  €{savings.toLocaleString()}
                </div>
                <div className="text-lg">
                  per year with <span className="font-bold">{numTrucks}</span> trucks at{' '}
                  <span className="font-bold">{kmPerYear.toLocaleString()}</span> km/year
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
                  <Truck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    Even a small reduction in empty runs — just <strong>{reductionPercent}%</strong> — can result in thousands of euros saved annually.
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
                  <Euro className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Many of our users save even more</strong>, and you can too by optimizing your routes and reducing empty kilometers.
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="block w-full bg-zinc-900 hover:bg-zinc-800 text-white text-center py-4 px-6 rounded-xl font-semibold transition-colors"
              >
                Start Saving Today
              </Link>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Fuel className="h-6 w-6 text-emerald-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">-{reductionPercent}%</div>
                <div className="text-xs text-gray-600">Empty runs</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Clock className="h-6 w-6 text-emerald-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-xs text-gray-600">Platform access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-zinc-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to maximize your profits?</h3>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Join thousands of European transporters who are already saving money and reducing empty runs with our platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-emerald-400 hover:bg-emerald-300 text-zinc-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/pricing"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
