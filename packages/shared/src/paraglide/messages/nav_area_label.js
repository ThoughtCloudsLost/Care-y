/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ area: NonNullable<unknown> }} Nav_Area_LabelInputs */

const en_nav_area_label = /** @type {(inputs: Nav_Area_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You are in: ${i?.area}`)
};

const es_nav_area_label = /** @type {(inputs: Nav_Area_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Estás en: ${i?.area}`)
};

const en_xa2_nav_area_label = /** @type {(inputs: Nav_Area_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòù àrè ìn:  ••••${i?.area}⟧`)
};

/**
* | output |
* | --- |
* | "You are in: {area}" |
*
* @param {Nav_Area_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_area_label = /** @type {((inputs: Nav_Area_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Area_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_area_label(inputs)
	if (locale === "en-XA") return en_xa2_nav_area_label(inputs)
	return en_nav_area_label(inputs)
});