/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_ExpiredInputs */

const en_admin_invite_pending_expired = /** @type {(inputs: Admin_Invite_Pending_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expired`)
};

const es_admin_invite_pending_expired = /** @type {(inputs: Admin_Invite_Pending_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expirado`)
};

/**
* | output |
* | --- |
* | "Expired" |
*
* @param {Admin_Invite_Pending_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_expired = /** @type {((inputs?: Admin_Invite_Pending_ExpiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_ExpiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_expired(inputs)
	return es_admin_invite_pending_expired(inputs)
});