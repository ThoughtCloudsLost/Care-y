/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Demo_Section_NextInputs */

const en_demo_section_next = /** @type {(inputs: Demo_Section_NextInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Continue to ${i?.section}`)
};

const es_demo_section_next = /** @type {(inputs: Demo_Section_NextInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Continuar a ${i?.section}`)
};

const en_xa2_demo_section_next = /** @type {(inputs: Demo_Section_NextInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè tò  ••••${i?.section}⟧`)
};

/**
* | output |
* | --- |
* | "Continue to {section}" |
*
* @param {Demo_Section_NextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_next = /** @type {((inputs: Demo_Section_NextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_NextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_next(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_next(inputs)
	return en_demo_section_next(inputs)
});