/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_Revoke_TitleInputs */

const en_admin_invite_pending_revoke_title = /** @type {(inputs: Admin_Invite_Pending_Revoke_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke Invite`)
};

const es_admin_invite_pending_revoke_title = /** @type {(inputs: Admin_Invite_Pending_Revoke_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar invitación`)
};

const en_xa2_admin_invite_pending_revoke_title = /** @type {(inputs: Admin_Invite_Pending_Revoke_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvòkè Ìnvìtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Revoke Invite" |
*
* @param {Admin_Invite_Pending_Revoke_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke_title = /** @type {((inputs?: Admin_Invite_Pending_Revoke_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Revoke_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_pending_revoke_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_pending_revoke_title(inputs)
	return en_admin_invite_pending_revoke_title(inputs)
});