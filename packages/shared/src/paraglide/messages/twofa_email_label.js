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

const en_xa2_twofa_email_label = /** @type {(inputs: Twofa_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl còdè •••⟧`)
};

/**
* | output |
* | --- |
* | "Email code" |
*
* @param {Twofa_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_label = /** @type {((inputs?: Twofa_Email_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_email_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_email_label(inputs)
	return en_twofa_email_label(inputs)
});