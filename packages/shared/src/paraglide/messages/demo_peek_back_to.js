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

const en_xa2_demo_peek_back_to = /** @type {(inputs: Demo_Peek_Back_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò  •••${i?.section}⟧`)
};

/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Peek_Back_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_peek_back_to = /** @type {((inputs: Demo_Peek_Back_ToInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Peek_Back_ToInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_peek_back_to(inputs)
	if (locale === "en-XA") return en_xa2_demo_peek_back_to(inputs)
	return en_demo_peek_back_to(inputs)
});