/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Communications_SubtextInputs */

const en_onboarding_communications_subtext = /** @type {(inputs: Onboarding_Communications_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure phone service, greetings, SMS templates, and blocked numbers. You can skip this and set it up later from admin settings.`)
};

const es_onboarding_communications_subtext = /** @type {(inputs: Onboarding_Communications_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure el servicio telefónico, saludos, plantillas SMS y números bloqueados. Puede omitir esto y configurarlo después desde los ajustes de administración.`)
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