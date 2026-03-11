export default function FlowAnimation() {
  return (
    <section className="py-16 bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Platform Ecosystem</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">See how clients, the platform and transporters connect in real time.</p>
        </div>
        <div className="w-full overflow-x-auto">
          <svg
            width="1200"
            height="700"
            viewBox="0 0 1200 700"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <defs>
              <style>{`
                .tc-heading { font-family: 'Inter', sans-serif; font-weight: 700; fill: #18181b; }
                .tc-text { font-family: 'Inter', sans-serif; font-weight: 400; fill: #666; }
                .tc-heading-white { font-family: 'Inter', sans-serif; font-weight: 700; fill: #ffffff; }
                .tc-text-white { font-family: 'Inter', sans-serif; font-weight: 400; fill: #e2e8f0; }
                .tc-badge-text { font-family: 'Inter', sans-serif; font-weight: 700; fill: #ffffff; }
              `}</style>

              <path
                id="mainPath"
                d="M 110 180 L 110 380 Q 110 480 170 480 L 430 480 L 760 480 Q 870 480 870 370 L 870 220 L 870 155 Q 870 110 870 110 L 210 110 Q 110 110 110 180 Z"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.5"
                opacity="0.2"
              />
              <path
                id="secondaryPath"
                d="M 180 155 Q 360 210 480 290 Q 580 360 600 470"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.5"
                opacity="0.2"
              />
              <path
                id="tertiaryPath1"
                d="M 860 110 L 1010 110 Q 1040 110 1052 85 T 1090 60"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.5"
                opacity="0.2"
              />
              <path
                id="tertiaryPath2"
                d="M 860 110 L 1010 110 Q 1040 110 1052 140 T 1090 170"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.5"
                opacity="0.2"
              />
            </defs>

            <rect width="1200" height="700" fill="#f4f7fa" />

            <use href="#mainPath" />
            <use href="#secondaryPath" />
            <use href="#tertiaryPath1" />
            <use href="#tertiaryPath2" />

            {/* Punct animat principal — TIR pe calea mare */}
            <g id="moving-dot">
              <animateMotion dur="18s" repeatCount="indefinite">
                <mpath href="#mainPath" />
              </animateMotion>
              <rect x="-22" y="-22" width="44" height="44" rx="10" fill="#18181b" />
              <text x="0" y="7" textAnchor="middle" fontSize="20">🚛</text>
            </g>

            {/* Punct animat secundar — pachet pe calea scurta */}
            <g id="secondary-dot">
              <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#secondaryPath" />
              </animateMotion>
              <circle r="13" fill="#f59e0b" opacity="0.9" />
              <text x="0" y="5" textAnchor="middle" fontSize="12">📦</text>
            </g>

            {/* Punct tertiar 1 — tracking bidirectional */}
            <g id="tertiary-dot1">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="860,110; 860,110"
                dur="8s"
                repeatCount="1"
              />
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                begin="8s"
                keyTimes="0;0.5;1"
                keyPoints="0;1;0"
              >
                <mpath href="#tertiaryPath1" />
              </animateMotion>
              <circle r="10" fill="#10b981" opacity="0.9" />
            </g>

            {/* Punct tertiar 2 — documente bidirectional */}
            <g id="tertiary-dot2">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="860,110; 860,110"
                dur="8s"
                repeatCount="1"
              />
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                begin="8s"
                keyTimes="0;0.5;1"
                keyPoints="0;1;0"
              >
                <mpath href="#tertiaryPath2" />
              </animateMotion>
              <circle r="10" fill="#10b981" opacity="0.9" />
            </g>

            {/* CARD 1: CLIENT */}
            <g transform="translate(12, 60)">
              <rect width="240" height="175" rx="14" fill="white" stroke="#f59e0b" strokeWidth="2.5" />
              <text x="120" y="42" textAnchor="middle" className="tc-heading" fontSize="16">🏢 Client / Shipper</text>
              <text x="120" y="68" textAnchor="middle" className="tc-text" fontSize="11">Manufacturing • Trading • Commerce</text>
              <text x="120" y="90" textAnchor="middle" className="tc-text" fontSize="11">Retail • E-commerce</text>
              <rect x="30" y="110" width="180" height="32" rx="16" fill="#f59e0b" />
              <text x="120" y="131" textAnchor="middle" className="tc-badge-text" fontSize="12">✓ KYC Verified</text>
            </g>

            {/* CARD 2: CERERI TRANSPORT */}
            <g transform="translate(12, 300)">
              <rect width="240" height="140" rx="14" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="120" y="38" textAnchor="middle" className="tc-heading" fontSize="15">📦 Shipment Requests</text>
              <text x="120" y="65" textAnchor="middle" className="tc-text" fontSize="11">Post route, container type,</text>
              <text x="120" y="85" textAnchor="middle" className="tc-text" fontSize="11">weight & preferred date</text>
              <text x="120" y="110" textAnchor="middle" className="tc-text" fontSize="11">Automatic broadcast to all</text>
              <text x="120" y="128" textAnchor="middle" className="tc-text" fontSize="11">verified transporters</text>
            </g>

            {/* CARD 3: MY NETWORK */}
            <g transform="translate(300, 275)">
              <rect width="210" height="120" rx="14" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="105" y="42" textAnchor="middle" className="tc-heading" fontSize="15">👥 My Network</text>
              <text x="105" y="68" textAnchor="middle" className="tc-text" fontSize="11">Preferred transporters</text>
              <text x="105" y="88" textAnchor="middle" className="tc-text" fontSize="11">saved & verified</text>
            </g>

            {/* CARD 4: AI MATCHING */}
            <g transform="translate(170, 520)">
              <rect width="210" height="120" rx="14" fill="#f59e0b" />
              <text x="105" y="42" textAnchor="middle" className="tc-heading-white" fontSize="15">🤖 AI Matching</text>
              <text x="105" y="68" textAnchor="middle" className="tc-text-white" fontSize="11">Smart algorithm suggests</text>
              <text x="105" y="88" textAnchor="middle" className="tc-text-white" fontSize="11">best transporters per route</text>
            </g>

            {/* ETICHETA Broadcast */}
            <g transform="translate(400, 345)">
              <rect x="20" y="0" width="180" height="36" rx="18" fill="#18181b" />
              <text x="110" y="23" textAnchor="middle" className="tc-text-white" fontSize="12">🔗 Broadcast Offer</text>
            </g>

            {/* CARD 5: PLATFORMA TRADE CONTAINER */}
            <g transform="translate(430, 390)">
              <rect width="280" height="210" rx="22" fill="#18181b" />
              <text x="140" y="52" textAnchor="middle" className="tc-heading-white" fontSize="28">🚢</text>
              <text x="140" y="95" textAnchor="middle" className="tc-heading-white" fontSize="22">TRADE CONTAINER</text>
              <text x="140" y="128" textAnchor="middle" className="tc-heading-white" fontSize="16">Freight Exchange</text>
              <text x="140" y="160" textAnchor="middle" className="tc-text-white" fontSize="11">30-day FREE trial</text>
              <text x="140" y="180" textAnchor="middle" className="tc-text-white" fontSize="11">Pan-European Coverage</text>
            </g>

            {/* CARD 6: RATING & OFFERS */}
            <g transform="translate(755, 520)">
              <rect width="210" height="120" rx="14" fill="#f59e0b" />
              <text x="105" y="42" textAnchor="middle" className="tc-heading-white" fontSize="15">⭐ Rating & Offers</text>
              <text x="105" y="68" textAnchor="middle" className="tc-text-white" fontSize="11">Compare prices, reviews</text>
              <text x="105" y="88" textAnchor="middle" className="tc-text-white" fontSize="11">& transporter profiles</text>
            </g>

            {/* CARD 7: OFFER MANAGEMENT */}
            <g transform="translate(750, 220)">
              <rect width="330" height="220" rx="14" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="165" y="38" textAnchor="middle" className="tc-heading" fontSize="16">🤝 Offer Management</text>
              <line x1="20" y1="55" x2="310" y2="55" stroke="#e0e0e0" strokeWidth="1.5" />
              <g transform="translate(18, 75)">
                <rect width="88" height="110" rx="10" fill="#f4f7fa" stroke="#e0e0e0" strokeWidth="1.5" />
                <text x="44" y="35" textAnchor="middle" fontSize="18">💬</text>
                <text x="44" y="62" textAnchor="middle" className="tc-text" fontSize="11">Live</text>
                <text x="44" y="80" textAnchor="middle" className="tc-text" fontSize="11">Chat</text>
              </g>
              <g transform="translate(121, 75)">
                <rect width="88" height="110" rx="10" fill="#f4f7fa" stroke="#e0e0e0" strokeWidth="1.5" />
                <text x="44" y="35" textAnchor="middle" fontSize="18">✅</text>
                <text x="44" y="62" textAnchor="middle" className="tc-text" fontSize="11">KYC</text>
                <text x="44" y="80" textAnchor="middle" className="tc-text" fontSize="11">Checks</text>
              </g>
              <g transform="translate(224, 75)">
                <rect width="88" height="110" rx="10" fill="#f4f7fa" stroke="#e0e0e0" strokeWidth="1.5" />
                <text x="44" y="35" textAnchor="middle" fontSize="18">📊</text>
                <text x="44" y="62" textAnchor="middle" className="tc-text" fontSize="11">Compare</text>
                <text x="44" y="80" textAnchor="middle" className="tc-text" fontSize="11">Offers</text>
              </g>
            </g>

            {/* CARD 8: TRANSPORT ORDER */}
            <g transform="translate(780, 50)">
              <rect width="210" height="130" rx="14" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="105" y="40" textAnchor="middle" className="tc-heading" fontSize="15">📄 Transport Order</text>
              <text x="22" y="68" className="tc-text" fontSize="11">• Digital CMR document</text>
              <text x="22" y="90" className="tc-text" fontSize="11">• Driver & plate info</text>
              <text x="22" y="112" className="tc-text" fontSize="11">• Agreed price confirmed</text>
            </g>

            {/* CARD 9: LIVE TRACKING */}
            <g transform="translate(1020, 25)">
              <rect width="165" height="100" rx="12" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="82" y="32" textAnchor="middle" className="tc-heading" fontSize="13">📍 Live Tracking</text>
              <text x="16" y="58" className="tc-text" fontSize="10">• Shipment status</text>
              <text x="16" y="76" className="tc-text" fontSize="10">• Real-time ETA updates</text>
            </g>

            {/* CARD 10: DIGITAL CMR */}
            <g transform="translate(1020, 145)">
              <rect width="165" height="100" rx="12" fill="white" stroke="#18181b" strokeWidth="2" strokeDasharray="6,6" />
              <text x="82" y="32" textAnchor="middle" className="tc-heading" fontSize="13">📋 Digital CMR</text>
              <text x="16" y="58" className="tc-text" fontSize="10">• Digital documents</text>
              <text x="16" y="76" className="tc-text" fontSize="10">• Proof of delivery</text>
            </g>

            {/* CARD 11: TRANSPORTER */}
            <g transform="translate(948, 275)">
              <rect width="240" height="175" rx="14" fill="white" stroke="#10b981" strokeWidth="2.5" />
              <text x="120" y="42" textAnchor="middle" className="tc-heading" fontSize="16">🚚 Transporter</text>
              <text x="120" y="68" textAnchor="middle" className="tc-text" fontSize="11">Carriers • Fleet operators</text>
              <text x="120" y="90" textAnchor="middle" className="tc-text" fontSize="11">Owner-operators • Brokers</text>
              <rect x="30" y="110" width="180" height="32" rx="16" fill="#10b981" />
              <text x="120" y="131" textAnchor="middle" className="tc-badge-text" fontSize="12">✓ KYC Verified</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
