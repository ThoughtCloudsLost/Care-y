/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ sub: NonNullable<unknown> }} Demo_Figure_Aria_LabelInputs */

const en_demo_figure_aria_label = /** @type {(inputs: Demo_Figure_Aria_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Hold to preview ${i?.sub}`)
};

const es_demo_figure_aria_label = /** @type {(inputs: Demo_Figure_Aria_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mantén pulsado para ver ${i?.sub}`)
};

/**
* | output |
* | --- |
* | "Hold to preview {sub}" |
*
* @param {Demo_Figure_Aria_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_figure_aria_label = /** @type {((inputs: Demo_Figure_Aria_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Figure_Aria_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_figure_aria_label(inputs)
	return es_demo_figure_aria_label(inputs)
});