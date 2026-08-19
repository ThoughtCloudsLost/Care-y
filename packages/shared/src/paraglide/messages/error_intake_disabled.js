/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_DisabledInputs */

const en_error_intake_disabled = /** @type {(inputs: Error_Intake_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Web intake is currently turned off.`)
};

const es_error_intake_disabled = /** @type {(inputs: Error_Intake_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La recepcion en linea esta desactivada.`)
};

/**
* | output |
* | --- |
* | "Web intake is currently turned off." |
*
* @param {Error_Intake_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_intake_disabled = /** @type {((inputs?: Error_Intake_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_intake_disabled(inputs)
	return es_error_intake_disabled(inputs)
});