/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Deletion_Already_RequestedInputs */

const en_error_deletion_already_requested = /** @type {(inputs: Error_Deletion_Already_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A deletion request for this organization is already in progress.`)
};

const es_error_deletion_already_requested = /** @type {(inputs: Error_Deletion_Already_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya hay una solicitud de eliminación en curso para esta organización.`)
};

const en_xa2_error_deletion_already_requested = /** @type {(inputs: Error_Deletion_Already_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À dèlètìòn rèqùèst fòr thìs òrgànìzàtìòn ìs àlrèàdy ìn prògrèss. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A deletion request for this organization is already in progress." |
*
* @param {Error_Deletion_Already_RequestedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_already_requested = /** @type {((inputs?: Error_Deletion_Already_RequestedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Deletion_Already_RequestedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_deletion_already_requested(inputs)
	if (locale === "en-XA") return en_xa2_error_deletion_already_requested(inputs)
	return en_error_deletion_already_requested(inputs)
});