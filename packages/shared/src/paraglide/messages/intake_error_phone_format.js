/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Phone_FormatInputs */

const en_intake_error_phone_format = /** @type {(inputs: Intake_Error_Phone_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a phone number like +1 555 000 1234.`)
};

const es_intake_error_phone_format = /** @type {(inputs: Intake_Error_Phone_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa un número de teléfono como +1 555 000 1234.`)
};

const en_xa2_intake_error_phone_format = /** @type {(inputs: Intake_Error_Phone_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à phònè nùmbèr lìkè +1 555 000 1234. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a phone number like +1 555 000 1234." |
*
* @param {Intake_Error_Phone_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_phone_format = /** @type {((inputs?: Intake_Error_Phone_FormatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Phone_FormatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_phone_format(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_phone_format(inputs)
	return en_intake_error_phone_format(inputs)
});