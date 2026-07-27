/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Conflict_TitleInputs */

const en_client_phone_conflict_title = /** @type {(inputs: Client_Phone_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone conflict`)
};

const es_client_phone_conflict_title = /** @type {(inputs: Client_Phone_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conflicto de telefono`)
};

/**
* | output |
* | --- |
* | "Phone conflict" |
*
* @param {Client_Phone_Conflict_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_title = /** @type {((inputs?: Client_Phone_Conflict_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Conflict_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_conflict_title(inputs)
	return es_client_phone_conflict_title(inputs)
});