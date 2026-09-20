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

const en_xa2_section_rail_hover_label = /** @type {(inputs: Section_Rail_Hover_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèctìòns fòr  ••••${i?.page}⟧`)
};

/**
* | output |
* | --- |
* | "Sections for {page}" |
*
* @param {Section_Rail_Hover_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const section_rail_hover_label = /** @type {((inputs: Section_Rail_Hover_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Section_Rail_Hover_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_section_rail_hover_label(inputs)
	if (locale === "en-XA") return en_xa2_section_rail_hover_label(inputs)
	return en_section_rail_hover_label(inputs)
});