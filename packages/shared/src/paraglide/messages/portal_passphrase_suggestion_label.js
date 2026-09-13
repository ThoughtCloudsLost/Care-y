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

/**
* | output |
* | --- |
* | "Here is a suggested password you can copy:" |
*
* @param {Portal_Passphrase_Suggestion_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_suggestion_label = /** @type {((inputs?: Portal_Passphrase_Suggestion_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Suggestion_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_suggestion_label(inputs)
	return es_portal_passphrase_suggestion_label(inputs)
});