/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_No_Org_KeyInputs */

const en_admin_invite_no_org_key = /** @type {(inputs: Admin_Invite_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key not loaded. Cannot invite users.`)
};

const es_admin_invite_no_org_key = /** @type {(inputs: Admin_Invite_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de organizacion no cargada. No se puede invitar usuarios.`)
};

/**
* | output |
* | --- |
* | "Organization key not loaded. Cannot invite users." |
*
* @param {Admin_Invite_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_no_org_key = /** @type {((inputs?: Admin_Invite_No_Org_KeyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_No_Org_KeyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_no_org_key(inputs)
	return es_admin_invite_no_org_key(inputs)
});