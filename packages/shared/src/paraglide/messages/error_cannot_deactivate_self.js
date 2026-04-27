/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Deactivate_SelfInputs */

const en_error_cannot_deactivate_self = /** @type {(inputs: Error_Cannot_Deactivate_SelfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You cannot deactivate your own account.`)
};

const es_error_cannot_deactivate_self = /** @type {(inputs: Error_Cannot_Deactivate_SelfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No puedes desactivar tu propia cuenta.`)
};

/**
* | output |
* | --- |
* | "You cannot deactivate your own account." |
*
* @param {Error_Cannot_Deactivate_SelfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_deactivate_self = /** @type {((inputs?: Error_Cannot_Deactivate_SelfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Deactivate_SelfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_cannot_deactivate_self(inputs)
	return es_error_cannot_deactivate_self(inputs)
});