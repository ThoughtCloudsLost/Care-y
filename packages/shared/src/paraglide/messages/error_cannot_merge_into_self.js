/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Cannot_Merge_Into_SelfInputs */

const en_error_cannot_merge_into_self = /** @type {(inputs: Error_Cannot_Merge_Into_SelfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cannot merge a ${i?.client} into itself.`)
};

const es_error_cannot_merge_into_self = /** @type {(inputs: Error_Cannot_Merge_Into_SelfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se puede fusionar un ${i?.client} consigo mismo.`)
};

const en_xa2_error_cannot_merge_into_self = /** @type {(inputs: Error_Cannot_Merge_Into_SelfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt mèrgè à  •••••${i?.client} ìntò ìtsèlf. ••••⟧`)
};

/**
* | output |
* | --- |
* | "Cannot merge a {client} into itself." |
*
* @param {Error_Cannot_Merge_Into_SelfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_merge_into_self = /** @type {((inputs: Error_Cannot_Merge_Into_SelfInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Merge_Into_SelfInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_cannot_merge_into_self(inputs)
	if (locale === "en-XA") return en_xa2_error_cannot_merge_into_self(inputs)
	return en_error_cannot_merge_into_self(inputs)
});