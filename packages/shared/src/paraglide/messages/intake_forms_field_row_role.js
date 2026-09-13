/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ role: NonNullable<unknown> }} Intake_Forms_Field_Row_RoleInputs */

const en_intake_forms_field_row_role = /** @type {(inputs: Intake_Forms_Field_Row_RoleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Role: ${i?.role}`)
};

const es_intake_forms_field_row_role = /** @type {(inputs: Intake_Forms_Field_Row_RoleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Rol: ${i?.role}`)
};

/**
* | output |
* | --- |
* | "Role: {role}" |
*
* @param {Intake_Forms_Field_Row_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_role = /** @type {((inputs: Intake_Forms_Field_Row_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_row_role(inputs)
	return es_intake_forms_field_row_role(inputs)
});