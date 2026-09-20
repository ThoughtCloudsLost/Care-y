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

const en_xa2_preview_note_internal = /** @type {(inputs: Preview_Note_InternalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl ·  ••••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Internal · {name}" |
*
* @param {Preview_Note_InternalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const preview_note_internal = /** @type {((inputs: Preview_Note_InternalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Preview_Note_InternalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_preview_note_internal(inputs)
	if (locale === "en-XA") return en_xa2_preview_note_internal(inputs)
	return en_preview_note_internal(inputs)
});