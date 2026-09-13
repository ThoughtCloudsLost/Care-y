/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Max_ReachedInputs */

const en_intake_avail_max_reached = /** @type {(inputs: Intake_Avail_Max_ReachedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Maximum reached.`)
};

const es_intake_avail_max_reached = /** @type {(inputs: Intake_Avail_Max_ReachedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Maximo alcanzado.`)
};

/**
* | output |
* | --- |
* | "Maximum reached." |
*
* @param {Intake_Avail_Max_ReachedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_max_reached = /** @type {((inputs?: Intake_Avail_Max_ReachedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Max_ReachedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_max_reached(inputs)
	return es_intake_avail_max_reached(inputs)
});