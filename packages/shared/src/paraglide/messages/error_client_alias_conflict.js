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

const en_xa2_error_client_alias_conflict = /** @type {(inputs: Error_Client_Alias_ConflictInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt àlìàs ìs àlrèàdy ìn ùsè. Chòòsè à dìffèrènt ònè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That alias is already in use. Choose a different one." |
*
* @param {Error_Client_Alias_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_client_alias_conflict = /** @type {((inputs?: Error_Client_Alias_ConflictInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Client_Alias_ConflictInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_client_alias_conflict(inputs)
	if (locale === "en-XA") return en_xa2_error_client_alias_conflict(inputs)
	return en_error_client_alias_conflict(inputs)
});