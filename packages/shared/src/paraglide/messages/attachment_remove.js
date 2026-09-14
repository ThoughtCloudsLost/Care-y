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

/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Attachment_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_remove = /** @type {((inputs: Attachment_RemoveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_RemoveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_remove(inputs)
	return en_attachment_remove(inputs)
});