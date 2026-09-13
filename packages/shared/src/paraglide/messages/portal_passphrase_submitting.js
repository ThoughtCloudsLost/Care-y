/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_SubmittingInputs */

const en_portal_passphrase_submitting = /** @type {(inputs: Portal_Passphrase_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adding password, please wait`)
};

const es_portal_passphrase_submitting = /** @type {(inputs: Portal_Passphrase_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregando contraseña, por favor espera`)
};

/**
* | output |
* | --- |
* | "Adding password, please wait" |
*
* @param {Portal_Passphrase_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_submitting = /** @type {((inputs?: Portal_Passphrase_SubmittingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_SubmittingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_submitting(inputs)
	return es_portal_passphrase_submitting(inputs)
});