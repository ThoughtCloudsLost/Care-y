/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_IntroInputs */

const en_onboarding_briefing_intro = /** @type {(inputs: Onboarding_Briefing_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y encrypts everything in the volunteer's browser before it reaches the server. The server stores only scrambled data it cannot read. Decryption requires the volunteer's password plus verification from two separate servers in different countries. No single server holds enough information to decrypt anything.`)
};

const es_onboarding_briefing_intro = /** @type {(inputs: Onboarding_Briefing_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y cifra todo en el navegador del voluntario antes de que llegue al servidor. El servidor almacena solo datos ilegibles. Descifrar requiere la contrasena del voluntario mas la verificacion de dos servidores separados en distintos paises. Ningun servidor individual tiene informacion suficiente para descifrar nada.`)
};

/**
* | output |
* | --- |
* | "CARE-Y encrypts everything in the volunteer's browser before it reaches the server. The server stores only scrambled data it cannot read. Decryption requires..." |
*
* @param {Onboarding_Briefing_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_intro = /** @type {((inputs?: Onboarding_Briefing_IntroInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_IntroInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_intro(inputs)
	return es_onboarding_briefing_intro(inputs)
});