/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Admin_InitialInputs */

const en_demo_role_admin_initial = /** @type {(inputs: Demo_Role_Admin_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A`)
};

const es_demo_role_admin_initial = /** @type {(inputs: Demo_Role_Admin_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A`)
};

/**
* | output |
* | --- |
* | "A" |
*
* @param {Demo_Role_Admin_InitialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_initial = /** @type {((inputs?: Demo_Role_Admin_InitialInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Admin_InitialInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_admin_initial(inputs)
	return es_demo_role_admin_initial(inputs)
});