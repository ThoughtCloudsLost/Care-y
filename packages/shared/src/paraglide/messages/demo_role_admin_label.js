/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Admin_LabelInputs */

const en_demo_role_admin_label = /** @type {(inputs: Demo_Role_Admin_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const es_demo_role_admin_label = /** @type {(inputs: Demo_Role_Admin_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administración`)
};

const en_xa2_demo_role_admin_label = /** @type {(inputs: Demo_Role_Admin_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdmìn ••⟧`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Demo_Role_Admin_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_label = /** @type {((inputs?: Demo_Role_Admin_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Admin_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_admin_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_admin_label(inputs)
	return en_demo_role_admin_label(inputs)
});