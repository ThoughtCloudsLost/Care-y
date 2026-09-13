/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ limit: NonNullable<unknown> }} Attachment_Too_LargeInputs */

const en_attachment_too_large = /** @type {(inputs: Attachment_Too_LargeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`That file is larger than the ${i?.limit} limit.`)
};

const es_attachment_too_large = /** @type {(inputs: Attachment_Too_LargeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ese archivo supera el límite de ${i?.limit}.`)
};

/**
* | output |
* | --- |
* | "That file is larger than the {limit} limit." |
*
* @param {Attachment_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_too_large = /** @type {((inputs: Attachment_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_attachment_too_large(inputs)
	return es_attachment_too_large(inputs)
});