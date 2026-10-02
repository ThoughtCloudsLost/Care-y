/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Api_Key_HintInputs */

const en_admin_donations_api_key_hint = /** @type {(inputs: Admin_Donations_Api_Key_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create an API key in your Givebutter dashboard, under Settings. The server stores the key encrypted and uses it only to read fund totals and to register a webhook, so totals refresh when a donation arrives.`)
};

const es_admin_donations_api_key_hint = /** @type {(inputs: Admin_Donations_Api_Key_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crea una clave de API en tu panel de Givebutter, en Settings. El servidor guarda la clave cifrada y solo la usa para leer los totales de los fondos y para registrar un webhook, para que los totales se actualicen cuando llegue una donación.`)
};

const en_xa2_admin_donations_api_key_hint = /** @type {(inputs: Admin_Donations_Api_Key_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè àn ÀPÌ kèy ìn yòùr Gìvèbùttèr dàshbòàrd, ùndèr Sèttìngs. Thè sèrvèr stòrès thè kèy èncryptèd ànd ùsès ìt ònly tò rèàd fùnd tòtàls ànd tò règìstèr à wèbhòòk, sò tòtàls rèfrèsh whèn à dònàtìòn àrrìvès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Create an API key in your Givebutter dashboard, under Settings. The server stores the key encrypted and uses it only to read fund totals and to register a we..." |
*
* @param {Admin_Donations_Api_Key_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_api_key_hint = /** @type {((inputs?: Admin_Donations_Api_Key_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Api_Key_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_api_key_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_api_key_hint(inputs)
	return en_admin_donations_api_key_hint(inputs)
});