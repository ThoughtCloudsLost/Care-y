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

const en_xa2_demo_section_prev = /** @type {(inputs: Demo_Section_PrevInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò  •••${i?.section}⟧`)
};

/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Section_PrevInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_prev = /** @type {((inputs: Demo_Section_PrevInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_PrevInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_prev(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_prev(inputs)
	return en_demo_section_prev(inputs)
});