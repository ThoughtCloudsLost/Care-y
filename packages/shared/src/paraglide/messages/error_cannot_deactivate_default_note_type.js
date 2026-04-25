/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Deactivate_Default_Note_TypeInputs */

const en_error_cannot_deactivate_default_note_type = /** @type {(inputs: Error_Cannot_Deactivate_Default_Note_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The default note type cannot be deactivated.`)
};

const es_error_cannot_deactivate_default_note_type = /** @type {(inputs: Error_Cannot_Deactivate_Default_Note_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El tipo de nota predeterminado no se puede desactivar.`)
};

/**
* | output |
* | --- |
* | "The default note type cannot be deactivated." |
*
* @param {Error_Cannot_Deactivate_Default_Note_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_deactivate_default_note_type = /** @type {((inputs?: Error_Cannot_Deactivate_Default_Note_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Deactivate_Default_Note_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_cannot_deactivate_default_note_type(inputs)
	return es_error_cannot_deactivate_default_note_type(inputs)
});