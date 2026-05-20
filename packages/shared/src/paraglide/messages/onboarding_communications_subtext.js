/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Communications_SubtextInputs */

const en_onboarding_communications_subtext = /** @type {(inputs: Onboarding_Communications_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure phone service, greetings, SMS templates, and blocked numbers. You can skip this and set it up later from admin settings.`)
};

const es_onboarding_communications_subtext = /** @type {(inputs: Onboarding_Communications_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure el servicio telefonico, saludos, plantillas SMS y numeros bloqueados. Puede omitir esto y configurarlo despues desde los ajustes de administracion.`)
};

/**
* | output |
* | --- |
* | "Configure phone service, greetings, SMS templates, and blocked numbers. You can skip this and set it up later from admin settings." |
*
* @param {Onboarding_Communications_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_subtext = /** @type {((inputs?: Onboarding_Communications_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Communications_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_communications_subtext(inputs)
	return es_onboarding_communications_subtext(inputs)
});