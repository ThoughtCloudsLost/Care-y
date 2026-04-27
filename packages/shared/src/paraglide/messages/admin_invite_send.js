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

/**
* | output |
* | --- |
* | "Create Account" |
*
* @param {Admin_Invite_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_send = /** @type {((inputs?: Admin_Invite_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_send(inputs)
	return es_admin_invite_send(inputs)
});