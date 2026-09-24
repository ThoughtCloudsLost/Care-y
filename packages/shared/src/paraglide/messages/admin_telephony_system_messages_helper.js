/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_System_Messages_HelperInputs */

const en_admin_telephony_system_messages_helper = /** @type {(inputs: Admin_Telephony_System_Messages_HelperInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The number used for appointment reminders and status updates`)
};

const es_admin_telephony_system_messages_helper = /** @type {(inputs: Admin_Telephony_System_Messages_HelperInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El número usado para recordatorios de citas y actualizaciones de estado`)
};

const en_xa2_admin_telephony_system_messages_helper = /** @type {(inputs: Admin_Telephony_System_Messages_HelperInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè nùmbèr ùsèd fòr àppòìntmènt rèmìndèrs ànd stàtùs ùpdàtès ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The number used for appointment reminders and status updates" |
*
* @param {Admin_Telephony_System_Messages_HelperInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_system_messages_helper = /** @type {((inputs?: Admin_Telephony_System_Messages_HelperInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_System_Messages_HelperInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_system_messages_helper(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_system_messages_helper(inputs)
	return en_admin_telephony_system_messages_helper(inputs)
});