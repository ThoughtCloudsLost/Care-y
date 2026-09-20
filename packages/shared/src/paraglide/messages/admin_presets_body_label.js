/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Body_LabelInputs */

const en_admin_presets_body_label = /** @type {(inputs: Admin_Presets_Body_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply text`)
};

const es_admin_presets_body_label = /** @type {(inputs: Admin_Presets_Body_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto de respuesta`)
};

/**
* | output |
* | --- |
* | "Reply text" |
*
* @param {Admin_Presets_Body_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_body_label = /** @type {((inputs?: Admin_Presets_Body_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Body_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_body_label(inputs)
	return en_admin_presets_body_label(inputs)
});