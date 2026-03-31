/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Merge_Into_SelfInputs */

const en_error_cannot_merge_into_self = /** @type {(inputs: Error_Cannot_Merge_Into_SelfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot merge a client into itself.`)
};

const es_error_cannot_merge_into_self = /** @type {(inputs: Error_Cannot_Merge_Into_SelfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se puede fusionar un cliente consigo mismo.`)
};

/**
* | output |
* | --- |
* | "Cannot merge a client into itself." |
*
* @param {Error_Cannot_Merge_Into_SelfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_merge_into_self = /** @type {((inputs?: Error_Cannot_Merge_Into_SelfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Merge_Into_SelfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_cannot_merge_into_self(inputs)
	return es_error_cannot_merge_into_self(inputs)
});