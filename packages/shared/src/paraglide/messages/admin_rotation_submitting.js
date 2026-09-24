/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_SubmittingInputs */

const en_admin_rotation_submitting = /** @type {(inputs: Admin_Rotation_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submitting to server...`)
};

const es_admin_rotation_submitting = /** @type {(inputs: Admin_Rotation_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando al servidor...`)
};

const en_xa2_admin_rotation_submitting = /** @type {(inputs: Admin_Rotation_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùbmìttìng tò sèrvèr... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Submitting to server..." |
*
* @param {Admin_Rotation_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_submitting = /** @type {((inputs?: Admin_Rotation_SubmittingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_SubmittingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_submitting(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_submitting(inputs)
	return en_admin_rotation_submitting(inputs)
});