/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Note_Type_ReservedInputs */

const en_error_note_type_reserved = /** @type {(inputs: Error_Note_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This note type is managed by the system and cannot be changed.`)
};

const es_error_note_type_reserved = /** @type {(inputs: Error_Note_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este tipo de nota lo gestiona el sistema y no se puede cambiar.`)
};

const en_xa2_error_note_type_reserved = /** @type {(inputs: Error_Note_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs nòtè typè ìs mànàgèd by thè systèm ànd cànnòt bè chàngèd. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This note type is managed by the system and cannot be changed." |
*
* @param {Error_Note_Type_ReservedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_note_type_reserved = /** @type {((inputs?: Error_Note_Type_ReservedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Note_Type_ReservedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_note_type_reserved(inputs)
	if (locale === "en-XA") return en_xa2_error_note_type_reserved(inputs)
	return en_error_note_type_reserved(inputs)
});