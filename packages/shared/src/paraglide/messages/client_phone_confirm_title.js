/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Confirm_TitleInputs */

const en_client_phone_confirm_title = /** @type {(inputs: Client_Phone_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm phone change`)
};

const es_client_phone_confirm_title = /** @type {(inputs: Client_Phone_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar cambio de telefono`)
};

/**
* | output |
* | --- |
* | "Confirm phone change" |
*
* @param {Client_Phone_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_confirm_title = /** @type {((inputs?: Client_Phone_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_confirm_title(inputs)
	return es_client_phone_confirm_title(inputs)
});