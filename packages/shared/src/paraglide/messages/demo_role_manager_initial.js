/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Manager_InitialInputs */

const en_demo_role_manager_initial = /** @type {(inputs: Demo_Role_Manager_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`M`)
};

const es_demo_role_manager_initial = /** @type {(inputs: Demo_Role_Manager_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`R`)
};

/**
* | output |
* | --- |
* | "M" |
*
* @param {Demo_Role_Manager_InitialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_initial = /** @type {((inputs?: Demo_Role_Manager_InitialInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Manager_InitialInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_manager_initial(inputs)
	return es_demo_role_manager_initial(inputs)
});