/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Intake_FormsInputs */

const en_permission_manage_intake_forms = /** @type {(inputs: Permission_Manage_Intake_FormsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage intake forms`)
};

const es_permission_manage_intake_forms = /** @type {(inputs: Permission_Manage_Intake_FormsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar formularios de ingreso`)
};

const en_xa2_permission_manage_intake_forms = /** @type {(inputs: Permission_Manage_Intake_FormsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè ìntàkè fòrms ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage intake forms" |
*
* @param {Permission_Manage_Intake_FormsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_intake_forms = /** @type {((inputs?: Permission_Manage_Intake_FormsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Intake_FormsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_intake_forms(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_intake_forms(inputs)
	return en_permission_manage_intake_forms(inputs)
});