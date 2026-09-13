/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ page: NonNullable<unknown> }} Section_Rail_Hover_LabelInputs */

const en_section_rail_hover_label = /** @type {(inputs: Section_Rail_Hover_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sections for ${i?.page}`)
};

const es_section_rail_hover_label = /** @type {(inputs: Section_Rail_Hover_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Secciones de ${i?.page}`)
};

/**
* | output |
* | --- |
* | "Sections for {page}" |
*
* @param {Section_Rail_Hover_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const section_rail_hover_label = /** @type {((inputs: Section_Rail_Hover_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Section_Rail_Hover_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_section_rail_hover_label(inputs)
	return es_section_rail_hover_label(inputs)
});