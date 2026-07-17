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

/**
* | output |
* | --- |
* | "You are in: {area}" |
*
* @param {Nav_Area_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_area_label = /** @type {((inputs: Nav_Area_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Area_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_area_label(inputs)
	return es_nav_area_label(inputs)
});