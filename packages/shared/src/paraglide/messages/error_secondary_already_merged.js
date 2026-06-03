/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Secondary_Already_MergedInputs */

const en_error_secondary_already_merged = /** @type {(inputs: Error_Secondary_Already_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Secondary ${i?.client} is already merged.`)
};

const es_error_secondary_already_merged = /** @type {(inputs: Error_Secondary_Already_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El ${i?.client} secundario ya está fusionado.`)
};

/**
* | output |
* | --- |
* | "Secondary {client} is already merged." |
*
* @param {Error_Secondary_Already_MergedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_secondary_already_merged = /** @type {((inputs: Error_Secondary_Already_MergedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Secondary_Already_MergedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_secondary_already_merged(inputs)
	return es_error_secondary_already_merged(inputs)
});