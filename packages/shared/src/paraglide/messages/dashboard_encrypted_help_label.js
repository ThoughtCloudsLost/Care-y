/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Encrypted_Help_LabelInputs */

const en_dashboard_encrypted_help_label = /** @type {(inputs: Dashboard_Encrypted_Help_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Why is this encrypted?`)
};

const es_dashboard_encrypted_help_label = /** @type {(inputs: Dashboard_Encrypted_Help_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Por qué está cifrado?`)
};

const en_xa2_dashboard_encrypted_help_label = /** @type {(inputs: Dashboard_Encrypted_Help_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Why ìs thìs èncryptèd? •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Why is this encrypted?" |
*
* @param {Dashboard_Encrypted_Help_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help_label = /** @type {((inputs?: Dashboard_Encrypted_Help_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_Help_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_encrypted_help_label(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_encrypted_help_label(inputs)
	return en_dashboard_encrypted_help_label(inputs)
});