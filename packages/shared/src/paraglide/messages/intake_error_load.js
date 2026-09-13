/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_LoadInputs */

const en_intake_error_load = /** @type {(inputs: Intake_Error_LoadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The form couldn't load. Check your connection and try again.`)
};

const es_intake_error_load = /** @type {(inputs: Intake_Error_LoadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario no se pudo cargar. Revisa tu conexión e intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "The form couldn't load. Check your connection and try again." |
*
* @param {Intake_Error_LoadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_load = /** @type {((inputs?: Intake_Error_LoadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_LoadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_load(inputs)
	return es_intake_error_load(inputs)
});