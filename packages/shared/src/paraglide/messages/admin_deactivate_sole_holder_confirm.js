/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Deactivate_Sole_Holder_ConfirmInputs */

const en_admin_deactivate_sole_holder_confirm = /** @type {(inputs: Admin_Deactivate_Sole_Holder_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deactivate anyway`)
};

const es_admin_deactivate_sole_holder_confirm = /** @type {(inputs: Admin_Deactivate_Sole_Holder_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar de todos modos`)
};

/**
* | output |
* | --- |
* | "Deactivate anyway" |
*
* @param {Admin_Deactivate_Sole_Holder_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_confirm = /** @type {((inputs?: Admin_Deactivate_Sole_Holder_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_Sole_Holder_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate_sole_holder_confirm(inputs)
	return en_admin_deactivate_sole_holder_confirm(inputs)
});