/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Email_LabelInputs */

const en_portal_correction_email_label = /** @type {(inputs: Portal_Correction_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New email`)
};

const es_portal_correction_email_label = /** @type {(inputs: Portal_Correction_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo correo electrónico`)
};

const en_xa2_portal_correction_email_label = /** @type {(inputs: Portal_Correction_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw èmàìl •••⟧`)
};

/**
* | output |
* | --- |
* | "New email" |
*
* @param {Portal_Correction_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_email_label = /** @type {((inputs?: Portal_Correction_Email_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Email_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_correction_email_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_correction_email_label(inputs)
	return en_portal_correction_email_label(inputs)
});