/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_WhyInputs */

const en_onboarding_briefing_choice_vpn_why = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every time a volunteer opens CARE-Y, their internet provider logs a connection to your server. If someone obtains those logs, they learn that this person is involved with your organization. A VPN routes all internet traffic through a separate server, so the internet provider only sees a connection to the VPN, not to your CARE-Y site. The VPN provider can still see where the traffic goes, so choose a trustworthy provider that does not keep logs.`)
};

const es_onboarding_briefing_choice_vpn_why = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada vez que un voluntario abre CARE-Y, su proveedor de internet registra una conexion a tu servidor. Si alguien obtiene esos registros, sabra que esa persona esta involucrada con tu organizacion. Una VPN enruta todo el trafico de internet a traves de un servidor separado, de modo que el proveedor de internet solo ve una conexion a la VPN, no a tu sitio de CARE-Y. El proveedor de VPN puede ver a donde va el trafico, asi que elige un proveedor confiable que no guarde registros.`)
};

/**
* | output |
* | --- |
* | "Every time a volunteer opens CARE-Y, their internet provider logs a connection to your server. If someone obtains those logs, they learn that this person is ..." |
*
* @param {Onboarding_Briefing_Choice_Vpn_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_vpn_why(inputs)
	return es_onboarding_briefing_choice_vpn_why(inputs)
});