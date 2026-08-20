/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Demo_Peek_Back_ToInputs */

const en_demo_peek_back_to = /** @type {(inputs: Demo_Peek_Back_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Back to ${i?.section}`)
};

const es_demo_peek_back_to = /** @type {(inputs: Demo_Peek_Back_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Volver a ${i?.section}`)
};

/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Peek_Back_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_peek_back_to = /** @type {((inputs: Demo_Peek_Back_ToInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Peek_Back_ToInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_peek_back_to(inputs)
	return es_demo_peek_back_to(inputs)
});