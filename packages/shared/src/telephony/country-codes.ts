/**
 * ITU-T E.164 country calling code allowlist.
 *
 * All assigned country calling codes as of 2026. Used for input validation
 * before phone number normalization. Codes include the leading "+".
 */
export const E164_COUNTRY_CODES: ReadonlySet<string> = new Set([
  "+1", // NANP (US, CA, Caribbean)
  "+7", // Russia, Kazakhstan
  "+20", // Egypt
  "+27", // South Africa
  "+30", // Greece
  "+31", // Netherlands
  "+32", // Belgium
  "+33", // France
  "+34", // Spain
  "+36", // Hungary
  "+39", // Italy
  "+40", // Romania
  "+41", // Switzerland
  "+43", // Austria
  "+44", // UK
  "+45", // Denmark
  "+46", // Sweden
  "+47", // Norway
  "+48", // Poland
  "+49", // Germany
  "+51", // Peru
  "+52", // Mexico
  "+53", // Cuba
  "+54", // Argentina
  "+55", // Brazil
  "+56", // Chile
  "+57", // Colombia
  "+58", // Venezuela
  "+60", // Malaysia
  "+61", // Australia
  "+62", // Indonesia
  "+63", // Philippines
  "+64", // New Zealand
  "+65", // Singapore
  "+66", // Thailand
  "+81", // Japan
  "+82", // South Korea
  "+84", // Vietnam
  "+86", // China
  "+90", // Turkey
  "+91", // India
  "+92", // Pakistan
  "+93", // Afghanistan
  "+94", // Sri Lanka
  "+95", // Myanmar
  "+98", // Iran
  "+211", // South Sudan
  "+212", // Morocco
  "+213", // Algeria
  "+216", // Tunisia
  "+218", // Libya
  "+220", // Gambia
  "+221", // Senegal
  "+222", // Mauritania
  "+223", // Mali
  "+224", // Guinea
  "+225", // Ivory Coast
  "+226", // Burkina Faso
  "+227", // Niger
  "+228", // Togo
  "+229", // Benin
  "+230", // Mauritius
  "+231", // Liberia
  "+232", // Sierra Leone
  "+233", // Ghana
  "+234", // Nigeria
  "+235", // Chad
  "+236", // Central African Republic
  "+237", // Cameroon
  "+238", // Cape Verde
  "+239", // Sao Tome and Principe
  "+240", // Equatorial Guinea
  "+241", // Gabon
  "+242", // Republic of the Congo
  "+243", // DR Congo
  "+244", // Angola
  "+245", // Guinea-Bissau
  "+246", // Diego Garcia
  "+247", // Ascension Island
  "+248", // Seychelles
  "+249", // Sudan
  "+250", // Rwanda
  "+251", // Ethiopia
  "+252", // Somalia
  "+253", // Djibouti
  "+254", // Kenya
  "+255", // Tanzania
  "+256", // Uganda
  "+257", // Burundi
  "+258", // Mozambique
  "+260", // Zambia
  "+261", // Madagascar
  "+262", // Reunion
  "+263", // Zimbabwe
  "+264", // Namibia
  "+265", // Malawi
  "+266", // Lesotho
  "+267", // Botswana
  "+268", // Eswatini
  "+269", // Comoros
  "+290", // Saint Helena
  "+291", // Eritrea
  "+297", // Aruba
  "+298", // Faroe Islands
  "+299", // Greenland
  "+350", // Gibraltar
  "+351", // Portugal
  "+352", // Luxembourg
  "+353", // Ireland
  "+354", // Iceland
  "+355", // Albania
  "+356", // Malta
  "+357", // Cyprus
  "+358", // Finland
  "+359", // Bulgaria
  "+370", // Lithuania
  "+371", // Latvia
  "+372", // Estonia
  "+373", // Moldova
  "+374", // Armenia
  "+375", // Belarus
  "+376", // Andorra
  "+377", // Monaco
  "+378", // San Marino
  "+380", // Ukraine
  "+381", // Serbia
  "+382", // Montenegro
  "+383", // Kosovo
  "+385", // Croatia
  "+386", // Slovenia
  "+387", // Bosnia and Herzegovina
  "+389", // North Macedonia
  "+420", // Czech Republic
  "+421", // Slovakia
  "+423", // Liechtenstein
  "+500", // Falkland Islands
  "+501", // Belize
  "+502", // Guatemala
  "+503", // El Salvador
  "+504", // Honduras
  "+505", // Nicaragua
  "+506", // Costa Rica
  "+507", // Panama
  "+508", // Saint Pierre and Miquelon
  "+509", // Haiti
  "+590", // Guadeloupe
  "+591", // Bolivia
  "+592", // Guyana
  "+593", // Ecuador
  "+594", // French Guiana
  "+595", // Paraguay
  "+596", // Martinique
  "+597", // Suriname
  "+598", // Uruguay
  "+599", // Curacao
  "+670", // East Timor
  "+672", // Norfolk Island
  "+673", // Brunei
  "+674", // Nauru
  "+675", // Papua New Guinea
  "+676", // Tonga
  "+677", // Solomon Islands
  "+678", // Vanuatu
  "+679", // Fiji
  "+680", // Palau
  "+681", // Wallis and Futuna
  "+682", // Cook Islands
  "+683", // Niue
  "+685", // Samoa
  "+686", // Kiribati
  "+687", // New Caledonia
  "+688", // Tuvalu
  "+689", // French Polynesia
  "+690", // Tokelau
  "+691", // Micronesia
  "+692", // Marshall Islands
  "+850", // North Korea
  "+852", // Hong Kong
  "+853", // Macau
  "+855", // Cambodia
  "+856", // Laos
  "+880", // Bangladesh
  "+886", // Taiwan
  "+960", // Maldives
  "+961", // Lebanon
  "+962", // Jordan
  "+963", // Syria
  "+964", // Iraq
  "+965", // Kuwait
  "+966", // Saudi Arabia
  "+967", // Yemen
  "+968", // Oman
  "+970", // Palestine
  "+971", // UAE
  "+972", // Israel
  "+973", // Bahrain
  "+974", // Qatar
  "+975", // Bhutan
  "+976", // Mongolia
  "+977", // Nepal
  "+992", // Tajikistan
  "+993", // Turkmenistan
  "+994", // Azerbaijan
  "+995", // Georgia
  "+996", // Kyrgyzstan
  "+998", // Uzbekistan
]);

/** Validates that a string is a recognized E.164 country calling code. */
export function isValidCountryCode(code: string): boolean {
  return E164_COUNTRY_CODES.has(code);
}

export interface CountryCodeOption {
  readonly code: string;
  readonly name: string;
}

/**
 * Country code options for dropdown selects.
 * Sorted alphabetically by country name.
 */
export const E164_COUNTRY_CODE_OPTIONS: readonly CountryCodeOption[] = [
  { code: "+93", name: "Afghanistan" },
  { code: "+355", name: "Albania" },
  { code: "+213", name: "Algeria" },
  { code: "+376", name: "Andorra" },
  { code: "+244", name: "Angola" },
  { code: "+54", name: "Argentina" },
  { code: "+374", name: "Armenia" },
  { code: "+297", name: "Aruba" },
  { code: "+247", name: "Ascension Island" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+973", name: "Bahrain" },
  { code: "+880", name: "Bangladesh" },
  { code: "+375", name: "Belarus" },
  { code: "+32", name: "Belgium" },
  { code: "+501", name: "Belize" },
  { code: "+229", name: "Benin" },
  { code: "+975", name: "Bhutan" },
  { code: "+591", name: "Bolivia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+267", name: "Botswana" },
  { code: "+55", name: "Brazil" },
  { code: "+673", name: "Brunei" },
  { code: "+359", name: "Bulgaria" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+257", name: "Burundi" },
  { code: "+855", name: "Cambodia" },
  { code: "+237", name: "Cameroon" },
  { code: "+238", name: "Cape Verde" },
  { code: "+236", name: "Central African Republic" },
  { code: "+235", name: "Chad" },
  { code: "+56", name: "Chile" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+269", name: "Comoros" },
  { code: "+682", name: "Cook Islands" },
  { code: "+506", name: "Costa Rica" },
  { code: "+385", name: "Croatia" },
  { code: "+53", name: "Cuba" },
  { code: "+599", name: "Curacao" },
  { code: "+357", name: "Cyprus" },
  { code: "+420", name: "Czech Republic" },
  { code: "+243", name: "DR Congo" },
  { code: "+45", name: "Denmark" },
  { code: "+246", name: "Diego Garcia" },
  { code: "+253", name: "Djibouti" },
  { code: "+670", name: "East Timor" },
  { code: "+593", name: "Ecuador" },
  { code: "+20", name: "Egypt" },
  { code: "+503", name: "El Salvador" },
  { code: "+240", name: "Equatorial Guinea" },
  { code: "+291", name: "Eritrea" },
  { code: "+372", name: "Estonia" },
  { code: "+268", name: "Eswatini" },
  { code: "+251", name: "Ethiopia" },
  { code: "+500", name: "Falkland Islands" },
  { code: "+298", name: "Faroe Islands" },
  { code: "+679", name: "Fiji" },
  { code: "+358", name: "Finland" },
  { code: "+33", name: "France" },
  { code: "+594", name: "French Guiana" },
  { code: "+689", name: "French Polynesia" },
  { code: "+241", name: "Gabon" },
  { code: "+220", name: "Gambia" },
  { code: "+995", name: "Georgia" },
  { code: "+49", name: "Germany" },
  { code: "+233", name: "Ghana" },
  { code: "+350", name: "Gibraltar" },
  { code: "+30", name: "Greece" },
  { code: "+299", name: "Greenland" },
  { code: "+590", name: "Guadeloupe" },
  { code: "+502", name: "Guatemala" },
  { code: "+224", name: "Guinea" },
  { code: "+245", name: "Guinea-Bissau" },
  { code: "+592", name: "Guyana" },
  { code: "+509", name: "Haiti" },
  { code: "+504", name: "Honduras" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+354", name: "Iceland" },
  { code: "+91", name: "India" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+964", name: "Iraq" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+225", name: "Ivory Coast" },
  { code: "+81", name: "Japan" },
  { code: "+962", name: "Jordan" },
  { code: "+254", name: "Kenya" },
  { code: "+686", name: "Kiribati" },
  { code: "+383", name: "Kosovo" },
  { code: "+965", name: "Kuwait" },
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+856", name: "Laos" },
  { code: "+371", name: "Latvia" },
  { code: "+961", name: "Lebanon" },
  { code: "+266", name: "Lesotho" },
  { code: "+231", name: "Liberia" },
  { code: "+218", name: "Libya" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+370", name: "Lithuania" },
  { code: "+352", name: "Luxembourg" },
  { code: "+853", name: "Macau" },
  { code: "+261", name: "Madagascar" },
  { code: "+265", name: "Malawi" },
  { code: "+60", name: "Malaysia" },
  { code: "+960", name: "Maldives" },
  { code: "+223", name: "Mali" },
  { code: "+356", name: "Malta" },
  { code: "+692", name: "Marshall Islands" },
  { code: "+596", name: "Martinique" },
  { code: "+222", name: "Mauritania" },
  { code: "+230", name: "Mauritius" },
  { code: "+52", name: "Mexico" },
  { code: "+691", name: "Micronesia" },
  { code: "+373", name: "Moldova" },
  { code: "+377", name: "Monaco" },
  { code: "+976", name: "Mongolia" },
  { code: "+382", name: "Montenegro" },
  { code: "+212", name: "Morocco" },
  { code: "+258", name: "Mozambique" },
  { code: "+95", name: "Myanmar" },
  { code: "+264", name: "Namibia" },
  { code: "+674", name: "Nauru" },
  { code: "+977", name: "Nepal" },
  { code: "+31", name: "Netherlands" },
  { code: "+687", name: "New Caledonia" },
  { code: "+64", name: "New Zealand" },
  { code: "+505", name: "Nicaragua" },
  { code: "+227", name: "Niger" },
  { code: "+234", name: "Nigeria" },
  { code: "+683", name: "Niue" },
  { code: "+672", name: "Norfolk Island" },
  { code: "+850", name: "North Korea" },
  { code: "+389", name: "North Macedonia" },
  { code: "+47", name: "Norway" },
  { code: "+968", name: "Oman" },
  { code: "+92", name: "Pakistan" },
  { code: "+680", name: "Palau" },
  { code: "+970", name: "Palestine" },
  { code: "+507", name: "Panama" },
  { code: "+675", name: "Papua New Guinea" },
  { code: "+595", name: "Paraguay" },
  { code: "+51", name: "Peru" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+974", name: "Qatar" },
  { code: "+242", name: "Republic of the Congo" },
  { code: "+262", name: "Reunion" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia / Kazakhstan" },
  { code: "+250", name: "Rwanda" },
  { code: "+290", name: "Saint Helena" },
  { code: "+508", name: "Saint Pierre and Miquelon" },
  { code: "+685", name: "Samoa" },
  { code: "+378", name: "San Marino" },
  { code: "+239", name: "Sao Tome and Principe" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+221", name: "Senegal" },
  { code: "+381", name: "Serbia" },
  { code: "+248", name: "Seychelles" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+65", name: "Singapore" },
  { code: "+421", name: "Slovakia" },
  { code: "+386", name: "Slovenia" },
  { code: "+677", name: "Solomon Islands" },
  { code: "+252", name: "Somalia" },
  { code: "+27", name: "South Africa" },
  { code: "+82", name: "South Korea" },
  { code: "+211", name: "South Sudan" },
  { code: "+34", name: "Spain" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+249", name: "Sudan" },
  { code: "+597", name: "Suriname" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+963", name: "Syria" },
  { code: "+886", name: "Taiwan" },
  { code: "+992", name: "Tajikistan" },
  { code: "+255", name: "Tanzania" },
  { code: "+66", name: "Thailand" },
  { code: "+228", name: "Togo" },
  { code: "+690", name: "Tokelau" },
  { code: "+676", name: "Tonga" },
  { code: "+216", name: "Tunisia" },
  { code: "+90", name: "Turkey" },
  { code: "+993", name: "Turkmenistan" },
  { code: "+688", name: "Tuvalu" },
  { code: "+256", name: "Uganda" },
  { code: "+380", name: "Ukraine" },
  { code: "+971", name: "UAE" },
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States / Canada" },
  { code: "+598", name: "Uruguay" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+678", name: "Vanuatu" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+681", name: "Wallis and Futuna" },
  { code: "+967", name: "Yemen" },
  { code: "+260", name: "Zambia" },
  { code: "+263", name: "Zimbabwe" },
];
