/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Tor_WhyInputs */

const en_onboarding_briefing_choice_tor_why = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Without Tor, your internet provider (and anyone who can access their records) can see that someone visited your CARE-Y site. Every connection includes an IP address, which reveals the user's physical location. They cannot read the encrypted content, but the connection itself reveals involvement and whereabouts.`)
};

const es_onboarding_briefing_choice_tor_why = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin Tor, tu proveedor de internet (y cualquiera que acceda a sus registros) puede ver que alguien visito tu sitio CARE-Y. Cada conexion incluye una direccion IP, que revela la ubicacion fisica del usuario. No pueden leer el contenido cifrado, pero la conexion misma revela la participacion y el paradero.`)
};

/**
* | output |
* | --- |
* | "Without Tor, your internet provider (and anyone who can access their records) can see that someone visited your CARE-Y site. Every connection includes an IP ..." |
*
* @param {Onboarding_Briefing_Choice_Tor_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Tor_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Tor_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_tor_why(inputs)
	return es_onboarding_briefing_choice_tor_why(inputs)
});