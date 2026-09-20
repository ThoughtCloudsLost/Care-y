/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Admin_Presets_SubtitleInputs */

const en_admin_presets_subtitle = /** @type {(inputs: Admin_Presets_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reusable reply templates for ${i?.volunteers}`)
};

const es_admin_presets_subtitle = /** @type {(inputs: Admin_Presets_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Plantillas de respuesta reutilizables para ${i?.volunteers}`)
};

/**
* | output |
* | --- |
* | "Reusable reply templates for {volunteers}" |
*
* @param {Admin_Presets_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_subtitle = /** @type {((inputs: Admin_Presets_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_subtitle(inputs)
	return en_admin_presets_subtitle(inputs)
});