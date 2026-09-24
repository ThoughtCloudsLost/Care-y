/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Conflict_TitleInputs */

const en_client_phone_conflict_title = /** @type {(inputs: Client_Phone_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone conflict`)
};

const es_client_phone_conflict_title = /** @type {(inputs: Client_Phone_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conflicto de teléfono`)
};

const en_xa2_client_phone_conflict_title = /** @type {(inputs: Client_Phone_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè cònflìct •••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone conflict" |
*
* @param {Client_Phone_Conflict_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_title = /** @type {((inputs?: Client_Phone_Conflict_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Conflict_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_conflict_title(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_conflict_title(inputs)
	return en_client_phone_conflict_title(inputs)
});