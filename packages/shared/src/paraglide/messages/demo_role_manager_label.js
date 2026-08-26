/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Manager_LabelInputs */

const en_demo_role_manager_label = /** @type {(inputs: Demo_Role_Manager_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager`)
};

const es_demo_role_manager_label = /** @type {(inputs: Demo_Role_Manager_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responsable`)
};

/**
* | output |
* | --- |
* | "Manager" |
*
* @param {Demo_Role_Manager_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_label = /** @type {((inputs?: Demo_Role_Manager_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Manager_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_manager_label(inputs)
	return es_demo_role_manager_label(inputs)
});