/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_ButtonInputs */

const en_admin_invite_button = /** @type {(inputs: Admin_Invite_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite`)
};

const es_admin_invite_button = /** @type {(inputs: Admin_Invite_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar`)
};

const en_xa2_admin_invite_button = /** @type {(inputs: Admin_Invite_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Invite" |
*
* @param {Admin_Invite_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_button = /** @type {((inputs?: Admin_Invite_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_button(inputs)
	return en_admin_invite_button(inputs)
});