/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Volunteer_InitialInputs */

const en_demo_role_volunteer_initial = /** @type {(inputs: Demo_Role_Volunteer_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`V`)
};

const es_demo_role_volunteer_initial = /** @type {(inputs: Demo_Role_Volunteer_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`V`)
};

const en_xa2_demo_role_volunteer_initial = /** @type {(inputs: Demo_Role_Volunteer_InitialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦V •⟧`)
};

/**
* | output |
* | --- |
* | "V" |
*
* @param {Demo_Role_Volunteer_InitialInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_initial = /** @type {((inputs?: Demo_Role_Volunteer_InitialInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Volunteer_InitialInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_volunteer_initial(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_volunteer_initial(inputs)
	return en_demo_role_volunteer_initial(inputs)
});