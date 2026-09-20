/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, clients: NonNullable<unknown> }} Admin_Presets_DescriptionInputs */

const en_admin_presets_description = /** @type {(inputs: Admin_Presets_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Saved replies appear in the compose bar when ${i?.volunteers} write to ${i?.clients}. Titles and content are encrypted with the organization key.`)
};

const es_admin_presets_description = /** @type {(inputs: Admin_Presets_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Las respuestas guardadas aparecen en la barra de redacción cuando ${i?.volunteers} escriben a ${i?.clients}. Los títulos y el contenido se cifran con la clave de la organización.`)
};

/**
* | output |
* | --- |
* | "Saved replies appear in the compose bar when {volunteers} write to {clients}. Titles and content are encrypted with the organization key." |
*
* @param {Admin_Presets_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_description = /** @type {((inputs: Admin_Presets_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_description(inputs)
	return en_admin_presets_description(inputs)
});