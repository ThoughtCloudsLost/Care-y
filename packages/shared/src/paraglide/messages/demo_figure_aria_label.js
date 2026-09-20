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

const en_xa2_demo_figure_aria_label = /** @type {(inputs: Demo_Figure_Aria_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Hòld tò prèvìèw  •••••${i?.sub}⟧`)
};

/**
* | output |
* | --- |
* | "Hold to preview {sub}" |
*
* @param {Demo_Figure_Aria_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_figure_aria_label = /** @type {((inputs: Demo_Figure_Aria_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Figure_Aria_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_figure_aria_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_figure_aria_label(inputs)
	return en_demo_figure_aria_label(inputs)
});