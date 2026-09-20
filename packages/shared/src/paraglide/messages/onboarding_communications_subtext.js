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

const en_xa2_onboarding_communications_subtext = /** @type {(inputs: Onboarding_Communications_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè phònè sèrvìcè, grèètìngs, SMS tèmplàtès, ànd blòckèd nùmbèrs. Yòù càn skìp thìs ànd sèt ìt ùp làtèr fròm àdmìn sèttìngs. •••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Configure phone service, greetings, SMS templates, and blocked numbers. You can skip this and set it up later from admin settings." |
*
* @param {Onboarding_Communications_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_subtext = /** @type {((inputs?: Onboarding_Communications_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Communications_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_communications_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_communications_subtext(inputs)
	return en_onboarding_communications_subtext(inputs)
});