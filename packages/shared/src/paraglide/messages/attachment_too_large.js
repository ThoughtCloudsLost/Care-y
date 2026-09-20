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

const en_xa2_attachment_too_large = /** @type {(inputs: Attachment_Too_LargeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thàt fìlè ìs làrgèr thàn thè  •••••••••${i?.limit} lìmìt. •••⟧`)
};

/**
* | output |
* | --- |
* | "That file is larger than the {limit} limit." |
*
* @param {Attachment_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_too_large = /** @type {((inputs: Attachment_Too_LargeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Too_LargeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_too_large(inputs)
	if (locale === "en-XA") return en_xa2_attachment_too_large(inputs)
	return en_attachment_too_large(inputs)
});