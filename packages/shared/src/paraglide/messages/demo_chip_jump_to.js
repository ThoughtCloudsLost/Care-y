/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ heading: NonNullable<unknown> }} Demo_Chip_Jump_ToInputs */

const en_demo_chip_jump_to = /** @type {(inputs: Demo_Chip_Jump_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Jump to ${i?.heading}`)
};

const es_demo_chip_jump_to = /** @type {(inputs: Demo_Chip_Jump_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ir a ${i?.heading}`)
};

const en_xa2_demo_chip_jump_to = /** @type {(inputs: Demo_Chip_Jump_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Jùmp tò  •••${i?.heading}⟧`)
};

/**
* | output |
* | --- |
* | "Jump to {heading}" |
*
* @param {Demo_Chip_Jump_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_chip_jump_to = /** @type {((inputs: Demo_Chip_Jump_ToInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Chip_Jump_ToInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_chip_jump_to(inputs)
	if (locale === "en-XA") return en_xa2_demo_chip_jump_to(inputs)
	return en_demo_chip_jump_to(inputs)
});