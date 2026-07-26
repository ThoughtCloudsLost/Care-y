/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Client_Alias_ConflictInputs */

const en_error_client_alias_conflict = /** @type {(inputs: Error_Client_Alias_ConflictInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That alias is already in use. Choose a different one.`)
};

const es_error_client_alias_conflict = /** @type {(inputs: Error_Client_Alias_ConflictInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese alias ya está en uso. Elige uno diferente.`)
};

/**
* | output |
* | --- |
* | "That alias is already in use. Choose a different one." |
*
* @param {Error_Client_Alias_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_client_alias_conflict = /** @type {((inputs?: Error_Client_Alias_ConflictInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Client_Alias_ConflictInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_client_alias_conflict(inputs)
	return es_error_client_alias_conflict(inputs)
});