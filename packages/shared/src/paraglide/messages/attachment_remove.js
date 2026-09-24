/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Attachment_RemoveInputs */

const en_attachment_remove = /** @type {(inputs: Attachment_RemoveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Remove ${i?.name}`)
};

const es_attachment_remove = /** @type {(inputs: Attachment_RemoveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Quitar ${i?.name}`)
};

const en_xa2_attachment_remove = /** @type {(inputs: Attachment_RemoveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè  •••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Attachment_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_remove = /** @type {((inputs: Attachment_RemoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_RemoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_remove(inputs)
	if (locale === "en-XA") return en_xa2_attachment_remove(inputs)
	return en_attachment_remove(inputs)
});