'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingDown, Truck, Euro } from 'lucide-react'

export default function SavingsCalculator() {
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-4">
            <TrendingDown className="h-4 w-4" />
            Savings Calculator
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See How Much You Could Save
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your potential annual savings by reducing empty runs with our platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Fleet Details</h3>

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

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors mb-4"
            >
              {showAdvanced ? '▴' : '▾'} Advanced filters
            </button>

            {showAdvanced && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average speed (km/h)
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Empty running (%)
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel consumption (l/100km)
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel price (€/liter)
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Driver rate (€/hour)
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reduction with platform (%)
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

          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-2xl p-8 text-zinc-900">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Your Potential Savings</h3>
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
                    <strong>Many of our users save even more</strong>, and you can too by optimizing your routes.
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
          </div>
        </div>
      </div>
    </section>
  )
}
