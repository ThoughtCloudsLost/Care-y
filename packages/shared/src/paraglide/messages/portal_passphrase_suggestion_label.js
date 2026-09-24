/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Suggestion_LabelInputs */

const en_portal_passphrase_suggestion_label = /** @type {(inputs: Portal_Passphrase_Suggestion_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Here is a suggested password you can copy:`)
};

const es_portal_passphrase_suggestion_label = /** @type {(inputs: Portal_Passphrase_Suggestion_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aquí tienes una contraseña sugerida que puedes copiar:`)
};

const en_xa2_portal_passphrase_suggestion_label = /** @type {(inputs: Portal_Passphrase_Suggestion_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hèrè ìs à sùggèstèd pàsswòrd yòù càn còpy: •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Here is a suggested password you can copy:" |
*
* @param {Portal_Passphrase_Suggestion_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_suggestion_label = /** @type {((inputs?: Portal_Passphrase_Suggestion_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Suggestion_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_suggestion_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_suggestion_label(inputs)
	return en_portal_passphrase_suggestion_label(inputs)
});