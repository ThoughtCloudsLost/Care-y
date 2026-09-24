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

const en_xa2_split_view_resize_label = /** @type {(inputs: Split_View_Resize_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsìzè pànèls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Resize panels" |
*
* @param {Split_View_Resize_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const split_view_resize_label = /** @type {((inputs?: Split_View_Resize_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Split_View_Resize_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_split_view_resize_label(inputs)
	if (locale === "en-XA") return en_xa2_split_view_resize_label(inputs)
	return en_split_view_resize_label(inputs)
});