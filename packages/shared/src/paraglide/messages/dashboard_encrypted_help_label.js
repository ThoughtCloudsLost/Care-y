/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Encrypted_Help_LabelInputs */

const en_dashboard_encrypted_help_label = /** @type {(inputs: Dashboard_Encrypted_Help_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Why is this encrypted?`)
};

const es_dashboard_encrypted_help_label = /** @type {(inputs: Dashboard_Encrypted_Help_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por que esta cifrado?`)
};

/**
* | output |
* | --- |
* | "Why is this encrypted?" |
*
* @param {Dashboard_Encrypted_Help_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help_label = /** @type {((inputs?: Dashboard_Encrypted_Help_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_Help_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_encrypted_help_label(inputs)
	return es_dashboard_encrypted_help_label(inputs)
});