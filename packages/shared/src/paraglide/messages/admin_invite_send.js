/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_SendInputs */

const en_admin_invite_send = /** @type {(inputs: Admin_Invite_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Account`)
};

const es_admin_invite_send = /** @type {(inputs: Admin_Invite_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear Cuenta`)
};

const en_xa2_admin_invite_send = /** @type {(inputs: Admin_Invite_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè Àccòùnt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Create Account" |
*
* @param {Admin_Invite_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_send = /** @type {((inputs?: Admin_Invite_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_send(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_send(inputs)
	return en_admin_invite_send(inputs)
});