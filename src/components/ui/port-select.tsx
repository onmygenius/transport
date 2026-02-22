'use client'

import { useState, useRef, useEffect } from 'react'
import { Anchor, ChevronDown, Search } from 'lucide-react'

export interface Port {
  name: string
  country: string
  code: string
}

export const EUROPEAN_PORTS: Port[] = [
  { name: 'Rotterdam', country: 'Netherlands', code: 'NLRTM' },
  { name: 'Antwerp', country: 'Belgium', code: 'BEANR' },
  { name: 'Hamburg', country: 'Germany', code: 'DEHAM' },
  { name: 'Bremerhaven', country: 'Germany', code: 'DEBRV' },
  { name: 'Felixstowe', country: 'United Kingdom', code: 'GBFXT' },
  { name: 'Southampton', country: 'United Kingdom', code: 'GBSOU' },
  { name: 'London Gateway', country: 'United Kingdom', code: 'GBLGP' },
  { name: 'Le Havre', country: 'France', code: 'FRLEH' },
  { name: 'Marseille', country: 'France', code: 'FRMRS' },
  { name: 'Barcelona', country: 'Spain', code: 'ESBCN' },
  { name: 'Valencia', country: 'Spain', code: 'ESVLC' },
  { name: 'Algeciras', country: 'Spain', code: 'ESALG' },
  { name: 'Bilbao', country: 'Spain', code: 'ESBIO' },
  { name: 'Genova', country: 'Italy', code: 'ITGOA' },
  { name: 'La Spezia', country: 'Italy', code: 'ITSPZ' },
  { name: 'Livorno', country: 'Italy', code: 'ITLIV' },
  { name: 'Gioia Tauro', country: 'Italy', code: 'ITGIT' },
  { name: 'Trieste', country: 'Italy', code: 'ITTRS' },
  { name: 'Venice', country: 'Italy', code: 'ITVCE' },
  { name: 'Piraeus', country: 'Greece', code: 'GRPIR' },
  { name: 'Thessaloniki', country: 'Greece', code: 'GRTHE' },
  { name: 'Constanta', country: 'Romania', code: 'ROCND' },
  { name: 'Gdansk', country: 'Poland', code: 'PLGDN' },
  { name: 'Gdynia', country: 'Poland', code: 'PLGDY' },
  { name: 'Koper', country: 'Slovenia', code: 'SIKOP' },
  { name: 'Rijeka', country: 'Croatia', code: 'HRRI' },
  { name: 'Split', country: 'Croatia', code: 'HRSPU' },
  { name: 'Tallinn', country: 'Estonia', code: 'EETLL' },
  { name: 'Riga', country: 'Latvia', code: 'LVRIX' },
  { name: 'Klaipeda', country: 'Lithuania', code: 'LTKLJ' },
  { name: 'Gothenburg', country: 'Sweden', code: 'SEGOT' },
  { name: 'Stockholm', country: 'Sweden', code: 'SESTO' },
  { name: 'Oslo', country: 'Norway', code: 'NOOSL' },
  { name: 'Bergen', country: 'Norway', code: 'NOBGO' },
  { name: 'Copenhagen', country: 'Denmark', code: 'DKCPH' },
  { name: 'Aarhus', country: 'Denmark', code: 'DKAAR' },
  { name: 'Helsinki', country: 'Finland', code: 'FIHEL' },
  { name: 'Lisbon', country: 'Portugal', code: 'PTLIS' },
  { name: 'Sines', country: 'Portugal', code: 'PTSIN' },
  { name: 'Leixoes', country: 'Portugal', code: 'PTLEI' },
  { name: 'Zeebrugge', country: 'Belgium', code: 'BEZEE' },
  { name: 'Amsterdam', country: 'Netherlands', code: 'NLAMS' },
  { name: 'Moerdijk', country: 'Netherlands', code: 'NLMOE' },
  { name: 'Dunkirk', country: 'France', code: 'FRDKK' },
  { name: 'Nantes', country: 'France', code: 'FRNTE' },
  { name: 'Bordeaux', country: 'France', code: 'FRBOD' },
  { name: 'Taranto', country: 'Italy', code: 'ITTAR' },
  { name: 'Naples', country: 'Italy', code: 'ITNAP' },
  { name: 'Palermo', country: 'Italy', code: 'ITPMO' },
  { name: 'Varna', country: 'Bulgaria', code: 'BGVAR' },
  { name: 'Burgas', country: 'Bulgaria', code: 'BGBOJ' },
  { name: 'Odessa', country: 'Ukraine', code: 'UAODS' },
  { name: 'Istanbul', country: 'Turkey', code: 'TRIST' },
  { name: 'Izmir', country: 'Turkey', code: 'TRIZM' },
  { name: 'Mersin', country: 'Turkey', code: 'TRMER' },
  { name: 'Novorossiysk', country: 'Russia', code: 'RUNVS' },
]

export const PORT_TERMINALS: Record<string, string[]> = {
  NLRTM: ['APM Terminals Maasvlakte II', 'ECT Delta Terminal', 'ECT City Terminal', 'Euromax Terminal', 'RWG (Rotterdam World Gateway)', 'HHLA CTA Rotterdam', 'Steinweg Terminal', 'Broekman Logistics'],
  BEANR: ['PSA Antwerp - Deurganckdok', 'PSA Antwerp - Noordzee Terminal', 'DP World Antwerp Gateway', 'MSC PSA European Terminal', 'Katoen Natie', 'Antwerp Terminal (AT)', 'Hessenatie Logistics'],
  DEHAM: ['HHLA Container Terminal Altenwerder (CTA)', 'HHLA Container Terminal Burchardkai (CTB)', 'HHLA Container Terminal Tollerort (CTT)', 'Eurogate Container Terminal Hamburg', 'Hamburger Hafen und Logistik (HHLA)'],
  DEBRV: ['Eurogate Container Terminal Bremerhaven', 'NTB (Norddeutsche Terminal Bremerhaven)', 'BLG Logistics', 'MSC Gate Bremerhaven'],
  GBFXT: ['Felixstowe North Terminal', 'Felixstowe South Terminal', 'Trinity Terminal', 'Landguard Terminal'],
  GBSOU: ['DP World Southampton', 'Itchen Container Terminal', 'Solent Stevedores'],
  GBLGP: ['London Gateway Port Terminal', 'DP World London Gateway'],
  FRLEH: ['Terminal de France (TDF)', 'Port 2000 - Terminal Porte Océane', 'TNMSC Le Havre', 'Terminaux de Normandie'],
  FRMRS: ['Fos Terminal (FOS2XL)', 'Seayard Fos-sur-Mer', 'Eurofos', 'GPMM Terminal'],
  ESBCN: ['APM Terminals Barcelona', 'TCB (Terminal de Contenidors de Barcelona)', 'BEST (Barcelona Europe South Terminal)', 'Noatum Container Terminal Barcelona'],
  ESVLC: ['MSC Terminal Valencia', 'Noatum Container Terminal Valencia', 'TTI Valencia', 'Grimaldi Terminal Valencia'],
  ESALG: ['APM Terminals Algeciras', 'TTT (Total Terminal International Algeciras)', 'Maersk Terminal Algeciras'],
  ESBIO: ['Noatum Container Terminal Bilbao', 'Zierbena Terminal'],
  ITGOA: ['PSA Genova Pra', 'VTE (Voltri Terminal Europa)', 'Sech Terminal', 'Terminal Rinfuse Genova'],
  ITSPZ: ['LSCT (La Spezia Container Terminal)', 'Terminal del Golfo', 'Contship Italia'],
  ITLIV: ['Lorenzini Terminal', 'Darsena Toscana', 'Terminal Calata Oriente'],
  ITGIT: ['MCT (Medcenter Container Terminal)', 'Contship Gioia Tauro'],
  ITTRS: ['Trieste Marine Terminal (TMT)', 'Samer Seaports & Cranes', 'Adriafer Terminal'],
  ITVCE: ['Vecon Terminal Venice', 'Terminal Intermodale Venezia'],
  GRPIR: ['PCT (Piraeus Container Terminal - Cosco)', 'PPA Pier I', 'PPA Pier II', 'Piraeus Port Authority'],
  GRTHE: ['ThPA (Thessaloniki Port Authority)', 'SEGT Terminal'],
  ROCND: ['CSCT (Constanta South Container Terminal)', 'Socep Terminal', 'APM Terminals Constanta', 'Comvex Terminal', 'Oil Terminal', 'Minmetal Terminal'],
  PLGDN: ['DCT Gdansk (Deepwater Container Terminal)', 'GTK Gdansk', 'Baltic Container Terminal'],
  PLGDY: ['BCT (Baltic Container Terminal Gdynia)', 'GCT (Gdynia Container Terminal)', 'Bałtycki Terminal Kontenerowy'],
  SIKOP: ['Luka Koper Container Terminal'],
  HRRI: ['AGCT (Adriatic Gate Container Terminal)', 'Luka Rijeka'],
  HRSPU: ['ICTSI Split Gate Terminal', 'Luka Split'],
  EETLL: ['Muuga Container Terminal', 'Old City Harbour Terminal', 'Paldiski South Harbour'],
  LVRIX: ['Riga Container Terminal (RCT)', 'Riga Universal Terminal', 'Strek Terminal'],
  LTKLJ: ['KLASCO Terminal', 'DFDS Seaways Terminal', 'Klaipedos Smelte'],
  SEGOT: ['APM Terminals Gothenburg', 'GCTS (Gothenburg Container Terminal)', 'Skandia Terminal'],
  SESTO: ['Stockholm Norvik Port', 'Frihamnen Terminal'],
  NOOSL: ['Oslo Havn Container Terminal', 'Sjursøya Terminal'],
  NOBGO: ['Bergen Container Terminal', 'Dokken Terminal'],
  DKCPH: ['Copenhagen Malmö Port (CMP)', 'Prøvestenen Terminal'],
  DKAAR: ['Aarhus Container Terminal (APM)', 'Pier 1 Terminal'],
  FIHEL: ['Vuosaari Harbour Terminal', 'Steveco Terminal Helsinki'],
  PTLIS: ['Liscont Terminal', 'Sotagus Terminal', 'TTL (Terminal de Contentores de Lisboa)'],
  PTSIN: ['PSA Sines Container Terminal (TCSA)', 'Sines Multipurpose Terminal'],
  PTLEI: ['TCL (Terminal de Contentores de Leixões)', 'TCGL Terminal'],
  BEZEE: ['APM Terminals Zeebrugge', 'PSA Zeebrugge', 'ICO Terminal'],
  NLAMS: ['Ceres Paragon Terminal', 'Steinweg Amsterdam', 'OVET Terminal'],
  NLMOE: ['Moerdijk Container Terminal (MCT)', 'Intermodal Terminal Moerdijk'],
  FRDKK: ['DFDS Terminal Dunkirk', 'Terminal des Flandres', 'Dunkerque Port Terminal'],
  FRNTE: ['Terminal de Montoir', 'Nantes Saint-Nazaire Port'],
  FRBOD: ['Bordeaux Atlantic Terminal', 'Terminal de Bassens'],
  ITTAR: ['Taranto Container Terminal (TCT)', 'Yilport Taranto'],
  ITNAP: ['Conateco Terminal Naples', 'Molo Bausan Terminal'],
  ITPMO: ['Terminal Palermo (Psa Palermo)', 'Grandi Navi Veloci Terminal'],
  BGVAR: ['Varna Container Terminal', 'Bulyard Terminal'],
  BGBOJ: ['Burgas Container Terminal', 'Port Burgas East Terminal'],
  UAODS: ['Odessa Container Terminal (OLVIA)', 'TIS Terminal', 'Yuzhne Port'],
  TRIST: ['Kumport Terminal', 'Marport Terminal', 'Borusan Lojistik Terminal', 'Evyap Port'],
  TRIZM: ['Alsancak Container Terminal', 'Egeli Terminal', 'Marport Izmir'],
  TRMER: ['Mersin International Port (MIP)', 'Akdeniz Terminal'],
  RUNVS: ['NUTEP Container Terminal', 'Novorossiysk Commercial Sea Port'],
}

interface TerminalSelectProps {
  portCode: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const OTHER_TERMINAL = '__other__'

export function TerminalSelect({ portCode, value, onChange, placeholder = 'Select terminal...' }: TerminalSelectProps) {
  const [open, setOpen] = useState(false)
  const [isOther, setIsOther] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const terminals = PORT_TERMINALS[portCode] || []

  useEffect(() => {
    setIsOther(false)
  }, [portCode])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (terminals.length === 0 || isOther) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={isOther && value === OTHER_TERMINAL ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter terminal name..."
          className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          style={{ color: '#111827' }}
          autoFocus={isOther}
        />
        {terminals.length > 0 && (
          <button
            type="button"
            onClick={() => { setIsOther(false); onChange('') }}
            className="shrink-0 h-9 px-2 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            ← List
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      >
        <span className={value ? 'text-gray-900 truncate text-left' : 'text-gray-400'}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="w-full px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 text-left border-b border-gray-100"
          >
            — No specific terminal —
          </button>
          {terminals.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false) }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${value === t ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setIsOther(true); onChange(''); setOpen(false) }}
            className="w-full px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
          >
            ✏️ Other (enter manually)
          </button>
        </div>
      )}
    </div>
  )
}

interface PortSelectProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function PortSelect({ placeholder = 'Select port...', value, onChange }: PortSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = EUROPEAN_PORTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus()
  }, [open])

  const selectedPort = EUROPEAN_PORTS.find(p => `${p.name}, ${p.country}` === value)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Anchor className="h-4 w-4 text-gray-400 shrink-0" />
          {selectedPort ? (
            <span className="text-gray-900 truncate flex items-center gap-1.5">
              <span className="font-medium">{selectedPort.name}</span>
              <span className="text-gray-500">{selectedPort.country}</span>
              <span className="text-gray-400 text-xs font-mono">{selectedPort.code}</span>
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search port or country..."
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ color: '#111827' }}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No ports found</div>
            ) : (
              filtered.map(port => (
                <button
                  key={port.code}
                  type="button"
                  onClick={() => {
                    onChange(`${port.name}, ${port.country}`)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${value === `${port.name}, ${port.country}` ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <Anchor className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium">{port.name}</span>
                    <span className="text-gray-500">{port.country}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{port.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
