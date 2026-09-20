/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Admin_No_UsersInputs */

const en_admin_no_users = /** @type {(inputs: Admin_No_UsersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No users yet. Invite your first ${i?.volunteer}.`)
};

const es_admin_no_users = /** @type {(inputs: Admin_No_UsersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin usuarios. Invita a tu primer ${i?.volunteer}.`)
};

const en_xa2_admin_no_users = /** @type {(inputs: Admin_No_UsersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò ùsèrs yèt. Ìnvìtè yòùr fìrst  ••••••••••${i?.volunteer}. •⟧`)
};

/**
* | output |
* | --- |
* | "No users yet. Invite your first {volunteer}." |
*
* @param {Admin_No_UsersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_no_users = /** @type {((inputs: Admin_No_UsersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_No_UsersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_no_users(inputs)
	if (locale === "en-XA") return en_xa2_admin_no_users(inputs)
	return en_admin_no_users(inputs)
});