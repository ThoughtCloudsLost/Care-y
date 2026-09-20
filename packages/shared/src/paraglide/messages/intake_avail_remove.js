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

const en_xa2_intake_avail_remove = /** @type {(inputs: Intake_Avail_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Intake_Avail_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_remove = /** @type {((inputs?: Intake_Avail_RemoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_RemoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_remove(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_remove(inputs)
	return en_intake_avail_remove(inputs)
});