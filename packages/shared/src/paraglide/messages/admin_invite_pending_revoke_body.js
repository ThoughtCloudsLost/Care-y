/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_Revoke_BodyInputs */

const en_admin_invite_pending_revoke_body = /** @type {(inputs: Admin_Invite_Pending_Revoke_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This will invalidate the invite link. Anyone who has the link will no longer be able to use it.`)
};

const es_admin_invite_pending_revoke_body = /** @type {(inputs: Admin_Invite_Pending_Revoke_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esto invalidara el enlace de invitacion. Cualquier persona que tenga el enlace ya no podra usarlo.`)
};

/**
* | output |
* | --- |
* | "This will invalidate the invite link. Anyone who has the link will no longer be able to use it." |
*
* @param {Admin_Invite_Pending_Revoke_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke_body = /** @type {((inputs?: Admin_Invite_Pending_Revoke_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Revoke_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_revoke_body(inputs)
	return es_admin_invite_pending_revoke_body(inputs)
});