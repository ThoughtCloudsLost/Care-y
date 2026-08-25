/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Demo_Section_PrevInputs */

const en_demo_section_prev = /** @type {(inputs: Demo_Section_PrevInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Back to ${i?.section}`)
};

const es_demo_section_prev = /** @type {(inputs: Demo_Section_PrevInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Volver a ${i?.section}`)
};

/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Section_PrevInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_prev = /** @type {((inputs: Demo_Section_PrevInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_PrevInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_prev(inputs)
	return es_demo_section_prev(inputs)
});