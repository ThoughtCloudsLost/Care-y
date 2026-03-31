/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_LabelInputs */

const en_twofa_email_label = /** @type {(inputs: Twofa_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email code`)
};

const es_twofa_email_label = /** @type {(inputs: Twofa_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código por correo electrónico`)
};

/**
* | output |
* | --- |
* | "Email code" |
*
* @param {Twofa_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_label = /** @type {((inputs?: Twofa_Email_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_label(inputs)
	return es_twofa_email_label(inputs)
});