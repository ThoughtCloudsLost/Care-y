/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Getting_Started_ProgressInputs */

const en_getting_started_progress = /** @type {(inputs: Getting_Started_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} of ${i?.total} complete`)
};

const es_getting_started_progress = /** @type {(inputs: Getting_Started_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} de ${i?.total} completados`)
};

/**
* | output |
* | --- |
* | "{done} of {total} complete" |
*
* @param {Getting_Started_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_progress = /** @type {((inputs: Getting_Started_ProgressInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_ProgressInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_progress(inputs)
	return es_getting_started_progress(inputs)
});