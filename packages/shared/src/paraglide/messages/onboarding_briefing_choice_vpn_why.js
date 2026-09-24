/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_WhyInputs */

const en_onboarding_briefing_choice_vpn_why = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every time a volunteer opens CARE-Y, their internet provider logs a connection to your server. If someone obtains those logs, they learn that this person is involved with your organization. A VPN routes all internet traffic through a separate server, so the internet provider only sees a connection to the VPN, not to your CARE-Y site. The VPN provider can still see where the traffic goes, so choose a trustworthy provider that does not keep logs.`)
};

const es_onboarding_briefing_choice_vpn_why = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada vez que un voluntario abre CARE-Y, su proveedor de internet registra una conexión a tu servidor. Si alguien obtiene esos registros, sabra que esa persona esta involucrada con tu organización. Una VPN enruta todo el tráfico de internet a traves de un servidor separado, de modo que el proveedor de internet solo ve una conexión a la VPN, no a tu sitio de CARE-Y. El proveedor de VPN puede ver a donde va el tráfico, así que elige un proveedor confiable que no guarde registros.`)
};

const en_xa2_onboarding_briefing_choice_vpn_why = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèry tìmè à vòlùntèèr òpèns CÀRÈ-Y, thèìr ìntèrnèt pròvìdèr lògs à cònnèctìòn tò yòùr sèrvèr. Ìf sòmèònè òbtàìns thòsè lògs, thèy lèàrn thàt thìs pèrsòn ìs ìnvòlvèd wìth yòùr òrgànìzàtìòn. À VPN ròùtès àll ìntèrnèt tràffìc thròùgh à sèpàràtè sèrvèr, sò thè ìntèrnèt pròvìdèr ònly sèès à cònnèctìòn tò thè VPN, nòt tò yòùr CÀRÈ-Y sìtè. Thè VPN pròvìdèr càn stìll sèè whèrè thè tràffìc gòès, sò chòòsè à trùstwòrthy pròvìdèr thàt dòès nòt kèèp lògs. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every time a volunteer opens CARE-Y, their internet provider logs a connection to your server. If someone obtains those logs, they learn that this person is ..." |
*
* @param {Onboarding_Briefing_Choice_Vpn_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_vpn_why(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_vpn_why(inputs)
	return en_onboarding_briefing_choice_vpn_why(inputs)
});