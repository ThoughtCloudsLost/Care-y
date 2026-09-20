/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Confirm_TitleInputs */

const en_client_phone_confirm_title = /** @type {(inputs: Client_Phone_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm phone change`)
};

const es_client_phone_confirm_title = /** @type {(inputs: Client_Phone_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar cambio de teléfono`)
};

const en_xa2_client_phone_confirm_title = /** @type {(inputs: Client_Phone_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm phònè chàngè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm phone change" |
*
* @param {Client_Phone_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_confirm_title = /** @type {((inputs?: Client_Phone_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_confirm_title(inputs)
	return en_client_phone_confirm_title(inputs)
});