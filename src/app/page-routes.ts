// Coordonate pentru toate porturile europene majore din sistem
export const MAJOR_PORTS = {
  // Nord Europa
  Rotterdam: { lat: 51.9225, lng: 4.4792 },
  Antwerp: { lat: 51.2194, lng: 4.4025 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Bremerhaven: { lat: 53.5395, lng: 8.5809 },
  Felixstowe: { lat: 51.9560, lng: 1.3520 },
  Southampton: { lat: 50.9097, lng: -1.4044 },
  'London Gateway': { lat: 51.5074, lng: 0.5500 },
  'Le Havre': { lat: 49.4944, lng: 0.1079 },
  Zeebrugge: { lat: 51.3397, lng: 3.2175 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Dunkirk: { lat: 51.0343, lng: 2.3767 },
  
  // Scandinavia & Baltic
  Gothenburg: { lat: 57.7089, lng: 11.9746 },
  Stockholm: { lat: 59.3293, lng: 18.0686 },
  Oslo: { lat: 59.9139, lng: 10.7522 },
  Copenhagen: { lat: 55.6761, lng: 12.5683 },
  Aarhus: { lat: 56.1629, lng: 10.2039 },
  Helsinki: { lat: 60.1695, lng: 24.9354 },
  Tallinn: { lat: 59.4370, lng: 24.7536 },
  Riga: { lat: 56.9496, lng: 24.1052 },
  Klaipeda: { lat: 55.7033, lng: 21.1443 },
  Gdansk: { lat: 54.3520, lng: 18.6466 },
  Gdynia: { lat: 54.5189, lng: 18.5305 },
  
  // Mediterana de Vest
  Barcelona: { lat: 41.3851, lng: 2.1734 },
  Valencia: { lat: 39.4699, lng: -0.3763 },
  Algeciras: { lat: 36.1408, lng: -5.3536 },
  Bilbao: { lat: 43.2627, lng: -2.9253 },
  Marseille: { lat: 43.2965, lng: 5.3698 },
  
  // Mediterana Centrală
  Genova: { lat: 44.4056, lng: 8.9463 },
  'La Spezia': { lat: 44.1024, lng: 9.8246 },
  Livorno: { lat: 43.5485, lng: 10.3106 },
  'Gioia Tauro': { lat: 38.2466, lng: 15.6389 },
  Naples: { lat: 40.8518, lng: 14.2681 },
  Trieste: { lat: 45.6495, lng: 13.7768 },
  Venice: { lat: 45.4408, lng: 12.3155 },
  
  // Adriatic
  Koper: { lat: 45.5481, lng: 13.7301 },
  Rijeka: { lat: 45.3271, lng: 14.4422 },
  
  // Mediterana de Est
  Piraeus: { lat: 37.9838, lng: 23.7275 },
  Thessaloniki: { lat: 40.6401, lng: 22.9444 },
  
  // Marea Neagră
  Constanta: { lat: 44.1598, lng: 28.6348 },
  Varna: { lat: 43.2141, lng: 27.9147 },
  Burgas: { lat: 42.5048, lng: 27.4626 },
  
  // Turcia
  Istanbul: { lat: 41.0082, lng: 28.9784 },
  Izmir: { lat: 38.4237, lng: 27.1428 },
  Mersin: { lat: 36.8000, lng: 34.0000 },
  
  // Peninsula Iberică
  Lisbon: { lat: 38.7223, lng: -9.1393 },
  Sines: { lat: 37.9553, lng: -8.8672 },
  Leixoes: { lat: 41.1760, lng: -8.7050 },
}

// Rețea de rute maritime realiste între porturi majore
export const createPortRoutes = () => [
  // Rotterdam - Hub Principal Europa
  { start: 'Rotterdam', end: 'Hamburg' },
  { start: 'Rotterdam', end: 'Antwerp' },
  { start: 'Rotterdam', end: 'Felixstowe' },
  { start: 'Rotterdam', end: 'Le Havre' },
  { start: 'Rotterdam', end: 'Genova' },
  { start: 'Rotterdam', end: 'Amsterdam' },
  { start: 'Rotterdam', end: 'Zeebrugge' },
  { start: 'Rotterdam', end: 'Lisbon' },
  { start: 'Rotterdam', end: 'Barcelona' },
  
  // Hamburg - Hub Nordic
  { start: 'Hamburg', end: 'Bremerhaven' },
  { start: 'Hamburg', end: 'Copenhagen' },
  { start: 'Hamburg', end: 'Gdynia' },
  { start: 'Hamburg', end: 'Gothenburg' },
  { start: 'Hamburg', end: 'Oslo' },
  { start: 'Hamburg', end: 'Genova' },
  { start: 'Hamburg', end: 'Barcelona' },
  
  // Antwerp
  { start: 'Antwerp', end: 'Le Havre' },
  { start: 'Antwerp', end: 'Southampton' },
  { start: 'Antwerp', end: 'Marseille' },
  { start: 'Antwerp', end: 'Zeebrugge' },
  { start: 'Antwerp', end: 'Dunkirk' },
  
  // Felixstowe & Southampton - UK
  { start: 'Felixstowe', end: 'Southampton' },
  { start: 'Felixstowe', end: 'Le Havre' },
  { start: 'Felixstowe', end: 'Marseille' },
  { start: 'Southampton', end: 'Le Havre' },
  { start: 'Southampton', end: 'Bilbao' },
  
  // Le Havre - Gateway França
  { start: 'Le Havre', end: 'Barcelona' },
  { start: 'Le Havre', end: 'Valencia' },
  { start: 'Le Havre', end: 'Genova' },
  { start: 'Le Havre', end: 'Marseille' },
  
  // Algeciras - Gateway Atlantic-Mediterranean
  { start: 'Algeciras', end: 'Valencia' },
  { start: 'Algeciras', end: 'Barcelona' },
  { start: 'Algeciras', end: 'Genova' },
  { start: 'Algeciras', end: 'Piraeus' },
  { start: 'Algeciras', end: 'Lisbon' },
  
  // Valencia & Barcelona - Spania
  { start: 'Valencia', end: 'Barcelona' },
  { start: 'Valencia', end: 'Marseille' },
  { start: 'Valencia', end: 'Genova' },
  { start: 'Barcelona', end: 'Marseille' },
  { start: 'Barcelona', end: 'Genova' },
  { start: 'Barcelona', end: 'Piraeus' },
  
  // Genova - Hub Mediterana
  { start: 'Genova', end: 'Marseille' },
  { start: 'Genova', end: 'La Spezia' },
  { start: 'Genova', end: 'Livorno' },
  { start: 'Genova', end: 'Naples' },
  { start: 'Genova', end: 'Gioia Tauro' },
  { start: 'Genova', end: 'Rijeka' },
  { start: 'Genova', end: 'Trieste' },
  { start: 'Genova', end: 'Piraeus' },
  
  // Piraeus - Hub Est Mediterana
  { start: 'Piraeus', end: 'Gioia Tauro' },
  { start: 'Piraeus', end: 'Istanbul' },
  { start: 'Piraeus', end: 'Constanta' },
  { start: 'Piraeus', end: 'Thessaloniki' },
  { start: 'Piraeus', end: 'Izmir' },
  { start: 'Piraeus', end: 'Mersin' },
  
  // Naples & Gioia Tauro - Italia Sud
  { start: 'Naples', end: 'Gioia Tauro' },
  { start: 'Naples', end: 'Piraeus' },
  { start: 'Gioia Tauro', end: 'Barcelona' },
  { start: 'Gioia Tauro', end: 'Algeciras' },
  
  // Trieste & Venice - Adriatic Nord
  { start: 'Trieste', end: 'Venice' },
  { start: 'Trieste', end: 'Koper' },
  { start: 'Trieste', end: 'Rijeka' },
  { start: 'Venice', end: 'Rijeka' },
  
  // Rijeka & Koper - Adriatic
  { start: 'Rijeka', end: 'Koper' },
  { start: 'Rijeka', end: 'Barcelona' },
  { start: 'Rijeka', end: 'Valencia' },
  
  // Constanta & Istanbul - Marea Neagră
  { start: 'Constanta', end: 'Istanbul' },
  { start: 'Constanta', end: 'Varna' },
  { start: 'Constanta', end: 'Burgas' },
  { start: 'Constanta', end: 'Gioia Tauro' },
  { start: 'Constanta', end: 'Riga' },
  { start: 'Constanta', end: 'Copenhagen' },
  { start: 'Constanta', end: 'Bilbao' },
  { start: 'Istanbul', end: 'Izmir' },
  { start: 'Istanbul', end: 'Mersin' },
  { start: 'Istanbul', end: 'Genova' },
  
  // Stockholm - Baltic
  { start: 'Stockholm', end: 'Gothenburg' },
  { start: 'Stockholm', end: 'Copenhagen' },
  { start: 'Stockholm', end: 'Gdynia' },
  { start: 'Stockholm', end: 'Helsinki' },
  { start: 'Stockholm', end: 'Tallinn' },
  { start: 'Stockholm', end: 'Genova' },
  
  // Copenhagen - Baltic Hub
  { start: 'Copenhagen', end: 'Gdynia' },
  { start: 'Copenhagen', end: 'Gothenburg' },
  { start: 'Copenhagen', end: 'Aarhus' },
  { start: 'Copenhagen', end: 'Oslo' },
  { start: 'Copenhagen', end: 'Rotterdam' },
  
  // Gdynia & Gdansk - Polonia
  { start: 'Gdynia', end: 'Gdansk' },
  { start: 'Gdynia', end: 'Rotterdam' },
  { start: 'Gdynia', end: 'Antwerp' },
  { start: 'Gdynia', end: 'Klaipeda' },
  
  // Gothenburg - Scandinavia Vest
  { start: 'Gothenburg', end: 'Oslo' },
  { start: 'Gothenburg', end: 'Rotterdam' },
  { start: 'Gothenburg', end: 'Antwerp' },
  
  // Helsinki & Tallinn - Baltic Nord
  { start: 'Helsinki', end: 'Tallinn' },
  { start: 'Helsinki', end: 'Riga' },
  { start: 'Tallinn', end: 'Riga' },
  { start: 'Riga', end: 'Klaipeda' },
  
  // Lisbon & Sines - Portugalia
  { start: 'Lisbon', end: 'Sines' },
  { start: 'Lisbon', end: 'Leixoes' },
  { start: 'Lisbon', end: 'Algeciras' },
  { start: 'Lisbon', end: 'Valencia' },
  { start: 'Sines', end: 'Algeciras' },
  
  // Marseille - Sud Franța
  { start: 'Marseille', end: 'Genova' },
  { start: 'Marseille', end: 'Barcelona' },
  { start: 'Marseille', end: 'Piraeus' },
]
