/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Phone_LabelInputs */

const en_portal_correction_phone_label = /** @type {(inputs: Portal_Correction_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New phone number`)
};

const es_portal_correction_phone_label = /** @type {(inputs: Portal_Correction_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo número de teléfono`)
};

const en_xa2_portal_correction_phone_label = /** @type {(inputs: Portal_Correction_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw phònè nùmbèr •••••⟧`)
};

/**
* | output |
* | --- |
* | "New phone number" |
*
* @param {Portal_Correction_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_phone_label = /** @type {((inputs?: Portal_Correction_Phone_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Phone_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_correction_phone_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_correction_phone_label(inputs)
	return en_portal_correction_phone_label(inputs)
});