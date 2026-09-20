/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_CancelInputs */

const en_admin_invite_cancel = /** @type {(inputs: Admin_Invite_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel`)
};

const es_admin_invite_cancel = /** @type {(inputs: Admin_Invite_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar`)
};

const en_xa2_admin_invite_cancel = /** @type {(inputs: Admin_Invite_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càncèl ••⟧`)
};

/**
* | output |
* | --- |
* | "Cancel" |
*
* @param {Admin_Invite_CancelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_cancel = /** @type {((inputs?: Admin_Invite_CancelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_CancelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_cancel(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_cancel(inputs)
	return en_admin_invite_cancel(inputs)
});