/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_RemoveInputs */

const en_intake_avail_remove = /** @type {(inputs: Intake_Avail_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove`)
};

const es_intake_avail_remove = /** @type {(inputs: Intake_Avail_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Intake_Avail_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_remove = /** @type {((inputs?: Intake_Avail_RemoveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_RemoveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_remove(inputs)
	return es_intake_avail_remove(inputs)
});