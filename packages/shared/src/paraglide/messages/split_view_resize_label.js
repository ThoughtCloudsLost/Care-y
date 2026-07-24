/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Split_View_Resize_LabelInputs */

const en_split_view_resize_label = /** @type {(inputs: Split_View_Resize_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resize panels`)
};

const es_split_view_resize_label = /** @type {(inputs: Split_View_Resize_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar el tamaño de los paneles`)
};

/**
* | output |
* | --- |
* | "Resize panels" |
*
* @param {Split_View_Resize_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const split_view_resize_label = /** @type {((inputs?: Split_View_Resize_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Split_View_Resize_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_split_view_resize_label(inputs)
	return es_split_view_resize_label(inputs)
});