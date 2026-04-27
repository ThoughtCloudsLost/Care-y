/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_System_MessagesInputs */

const en_admin_telephony_system_messages = /** @type {(inputs: Admin_Telephony_System_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Automated texts`)
};

const es_admin_telephony_system_messages = /** @type {(inputs: Admin_Telephony_System_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Textos automaticos`)
};

/**
* | output |
* | --- |
* | "Automated texts" |
*
* @param {Admin_Telephony_System_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_system_messages = /** @type {((inputs?: Admin_Telephony_System_MessagesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_System_MessagesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_system_messages(inputs)
	return es_admin_telephony_system_messages(inputs)
});