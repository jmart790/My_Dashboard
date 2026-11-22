// Pro teams (ESPN abbreviations) and where they play, so "local sports" can mean
// the teams nearest the reader. Coordinates are the metro area, not the stadium.

const METROS = {
  ATL: [33.75, -84.39], AUS: [30.27, -97.74], BAL: [39.29, -76.61], BOS: [42.36, -71.06],
  BUF: [42.89, -78.88], CGY: [51.05, -114.07], CHA: [35.23, -80.84], CHI: [41.88, -87.63],
  CIN: [39.1, -84.51], CLE: [41.5, -81.69], CLB: [39.96, -83.0], DAL: [32.78, -96.8],
  DEN: [39.74, -104.99], DET: [42.33, -83.05], EDM: [53.55, -113.49], GB: [44.51, -88.01],
  HOU: [29.76, -95.37], IND: [39.77, -86.16], JAX: [30.33, -81.66], KC: [39.1, -94.58],
  LV: [36.17, -115.14], LA: [34.05, -118.24], ANA: [33.84, -117.91], MEM: [35.15, -90.05],
  MIA: [25.76, -80.19], MIL: [43.04, -87.91], MIN: [44.98, -93.27], MTL: [45.5, -73.57],
  NSH: [36.16, -86.78], NO: [29.95, -90.07], NY: [40.71, -74.01], OKC: [35.47, -97.52],
  ORL: [28.54, -81.38], OTT: [45.42, -75.7], PHI: [39.95, -75.17], PHX: [33.45, -112.07],
  PIT: [40.44, -80.0], POR: [45.52, -122.68], RAL: [35.78, -78.64], SAC: [38.58, -121.49],
  SA: [29.42, -98.49], SD: [32.72, -117.16], SF: [37.77, -122.42], SJ: [37.34, -121.89],
  SEA: [47.61, -122.33], SLC: [40.76, -111.89], STL: [38.63, -90.2], TB: [27.95, -82.46],
  TOR: [43.65, -79.38], VAN: [49.28, -123.12], WPG: [49.9, -97.14], WSH: [38.91, -77.04],
};

// league path on ESPN's API -> "TEAM:METRO" pairs. MLS schedules are looked up by
// ESPN's team id, not abbreviation, so those read "TEAM#ID:METRO".
const LEAGUES = {
  'football/nfl':
    'ARI:PHX ATL:ATL BAL:BAL BUF:BUF CAR:CHA CHI:CHI CIN:CIN CLE:CLE DAL:DAL DEN:DEN DET:DET GB:GB ' +
    'HOU:HOU IND:IND JAX:JAX KC:KC LV:LV LAC:LA LAR:LA MIA:MIA MIN:MIN NE:BOS NO:NO NYG:NY NYJ:NY ' +
    'PHI:PHI PIT:PIT SF:SF SEA:SEA TB:TB TEN:NSH WSH:WSH',
  'basketball/nba':
    'ATL:ATL BOS:BOS BKN:NY CHA:CHA CHI:CHI CLE:CLE DAL:DAL DEN:DEN DET:DET GS:SF HOU:HOU IND:IND ' +
    'LAC:LA LAL:LA MEM:MEM MIA:MIA MIL:MIL MIN:MIN NO:NO NY:NY OKC:OKC ORL:ORL PHI:PHI PHX:PHX ' +
    'POR:POR SAC:SAC SA:SA TOR:TOR UTAH:SLC WSH:WSH',
  'baseball/mlb':
    'ARI:PHX ATH:SAC ATL:ATL BAL:BAL BOS:BOS CHC:CHI CHW:CHI CIN:CIN CLE:CLE COL:DEN DET:DET HOU:HOU ' +
    'KC:KC LAA:ANA LAD:LA MIA:MIA MIL:MIL MIN:MIN NYM:NY NYY:NY PHI:PHI PIT:PIT SD:SD SF:SF SEA:SEA ' +
    'STL:STL TB:TB TEX:DAL TOR:TOR WSH:WSH',
  'hockey/nhl':
    'ANA:ANA BOS:BOS BUF:BUF CGY:CGY CAR:RAL CHI:CHI COL:DEN CBJ:CLB DAL:DAL DET:DET EDM:EDM FLA:MIA ' +
    'LA:LA MIN:MIN MTL:MTL NSH:NSH NJ:NY NYI:NY NYR:NY OTT:OTT PHI:PHI PIT:PIT SJ:SJ SEA:SEA STL:STL ' +
    'TB:TB TOR:TOR UTAH:SLC VAN:VAN VGK:LV WSH:WSH WPG:WPG',
  'soccer/usa.1':
    'ATL#18418:ATL ATX#20906:AUS MTL#9720:MTL CLT#21300:CHA CHI#182:CHI COL#184:DEN CLB#183:CLB DC#193:WSH CIN#18267:CIN DAL#185:DAL HOU#6077:HOU MIA#20232:MIA ' +
    'LA#187:LA LAFC#18966:LA MIN#17362:MIN NSH#18986:NSH NE#189:BOS NYC#17606:NY ORL#12011:ORL PHI#10739:PHI POR#9723:POR RSL#4771:SLC RBNY#190:NY SD#22529:SD SJ#191:SJ ' +
    'SEA#9726:SEA SKC#186:KC STL#21812:STL TOR#7318:TOR VAN#9727:VAN',
};

export const TEAMS = Object.entries(LEAGUES).flatMap(([league, pairs]) =>
  pairs.split(' ').map((pair) => {
    const [team, metro] = pair.split(':');
    const [abbr, id] = team.split('#');
    return { league, abbr, id: id || abbr.toLowerCase(), metro, coords: METROS[metro] };
  })
);

const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance in miles. */
export function milesBetween([lat1, lon1], [lat2, lon2]) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(a));
}

export const LOCAL_MILES = 150;
const MAX_TEAMS = 8; // each team is one schedule request

/**
 * Teams within LOCAL_MILES, nearest first; if there are none (somewhere remote),
 * the teams of the nearest metro area instead.
 * @returns {{ teams: Array, nearby: boolean }}
 */
export function localTeams({ lat, lon }) {
  const here = [Number(lat), Number(lon)];
  const byDistance = TEAMS.map((team) => ({ ...team, miles: milesBetween(here, team.coords) })).sort(
    (a, b) => a.miles - b.miles
  );
  const close = byDistance.filter((team) => team.miles <= LOCAL_MILES);
  if (close.length) return { teams: close.slice(0, MAX_TEAMS), nearby: true };
  const nearestMetro = byDistance[0].metro;
  return { teams: byDistance.filter((team) => team.metro === nearestMetro).slice(0, MAX_TEAMS), nearby: false };
}
