/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown>, direction: NonNullable<unknown> }} Sort_Button_LabelInputs */

const en_sort_button_label = /** @type {(inputs: Sort_Button_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label}, ${i?.direction}`)
};

const es_sort_button_label = /** @type {(inputs: Sort_Button_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label}, ${i?.direction}`)
};

/**
* | output |
* | --- |
* | "{label}, {direction}" |
*
* @param {Sort_Button_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const sort_button_label = /** @type {((inputs: Sort_Button_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Sort_Button_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_sort_button_label(inputs)
	return es_sort_button_label(inputs)
});