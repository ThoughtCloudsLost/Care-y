/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Preview_Note_InternalInputs */

const en_preview_note_internal = /** @type {(inputs: Preview_Note_InternalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Internal · ${i?.name}`)
};

const es_preview_note_internal = /** @type {(inputs: Preview_Note_InternalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nota interna · ${i?.name}`)
};

/**
* | output |
* | --- |
* | "Internal · {name}" |
*
* @param {Preview_Note_InternalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const preview_note_internal = /** @type {((inputs: Preview_Note_InternalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Preview_Note_InternalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_preview_note_internal(inputs)
	return es_preview_note_internal(inputs)
});