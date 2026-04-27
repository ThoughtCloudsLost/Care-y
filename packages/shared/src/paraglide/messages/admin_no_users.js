/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_No_UsersInputs */

const en_admin_no_users = /** @type {(inputs: Admin_No_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No users yet. Invite your first volunteer.`)
};

const es_admin_no_users = /** @type {(inputs: Admin_No_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin usuarios. Invita a tu primer voluntario.`)
};

/**
* | output |
* | --- |
* | "No users yet. Invite your first volunteer." |
*
* @param {Admin_No_UsersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_no_users = /** @type {((inputs?: Admin_No_UsersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_No_UsersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_no_users(inputs)
	return es_admin_no_users(inputs)
});