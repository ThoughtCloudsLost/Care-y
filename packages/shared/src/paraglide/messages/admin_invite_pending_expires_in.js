/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown> }} Admin_Invite_Pending_Expires_InInputs */

const en_admin_invite_pending_expires_in = /** @type {(inputs: Admin_Invite_Pending_Expires_InInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expires ${i?.time}`)
};

const es_admin_invite_pending_expires_in = /** @type {(inputs: Admin_Invite_Pending_Expires_InInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expira ${i?.time}`)
};

/**
* | output |
* | --- |
* | "Expires {time}" |
*
* @param {Admin_Invite_Pending_Expires_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_expires_in = /** @type {((inputs: Admin_Invite_Pending_Expires_InInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Expires_InInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_expires_in(inputs)
	return es_admin_invite_pending_expires_in(inputs)
});