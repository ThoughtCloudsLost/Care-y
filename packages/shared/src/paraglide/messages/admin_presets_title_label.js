/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Title_LabelInputs */

const en_admin_presets_title_label = /** @type {(inputs: Admin_Presets_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title`)
};

const es_admin_presets_title_label = /** @type {(inputs: Admin_Presets_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título`)
};

const en_xa2_admin_presets_title_label = /** @type {(inputs: Admin_Presets_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè ••⟧`)
};

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Admin_Presets_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title_label = /** @type {((inputs?: Admin_Presets_Title_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Title_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_title_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_title_label(inputs)
	return en_admin_presets_title_label(inputs)
});