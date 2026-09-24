/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Invite_Pending_Invited_ByInputs */

const en_admin_invite_pending_invited_by = /** @type {(inputs: Admin_Invite_Pending_Invited_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invited by ${i?.name}`)
};

const es_admin_invite_pending_invited_by = /** @type {(inputs: Admin_Invite_Pending_Invited_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invitado por ${i?.name}`)
};

const en_xa2_admin_invite_pending_invited_by = /** @type {(inputs: Admin_Invite_Pending_Invited_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtèd by  ••••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Invited by {name}" |
*
* @param {Admin_Invite_Pending_Invited_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_invited_by = /** @type {((inputs: Admin_Invite_Pending_Invited_ByInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Invited_ByInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_pending_invited_by(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_pending_invited_by(inputs)
	return en_admin_invite_pending_invited_by(inputs)
});