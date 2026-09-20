/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Volunteer_LabelInputs */

const en_demo_role_volunteer_label = /** @type {(inputs: Demo_Role_Volunteer_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer`)
};

const es_demo_role_volunteer_label = /** @type {(inputs: Demo_Role_Volunteer_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntariado`)
};

const en_xa2_demo_role_volunteer_label = /** @type {(inputs: Demo_Role_Volunteer_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Demo_Role_Volunteer_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_label = /** @type {((inputs?: Demo_Role_Volunteer_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Volunteer_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_volunteer_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_volunteer_label(inputs)
	return en_demo_role_volunteer_label(inputs)
});