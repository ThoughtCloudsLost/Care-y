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

const en_xa2_getting_started_progress = /** @type {(inputs: Getting_Started_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.done} òf  ••${i?.total} còmplètè •••⟧`)
};

/**
* | output |
* | --- |
* | "{done} of {total} complete" |
*
* @param {Getting_Started_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_progress = /** @type {((inputs: Getting_Started_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_progress(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_progress(inputs)
	return en_getting_started_progress(inputs)
});