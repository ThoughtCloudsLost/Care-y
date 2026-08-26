/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Discard_ConfirmInputs */

const en_intake_forms_discard_confirm = /** @type {(inputs: Intake_Forms_Discard_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You have unsaved changes. Leave without saving?`)
};

const es_intake_forms_discard_confirm = /** @type {(inputs: Intake_Forms_Discard_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tiene cambios sin guardar. Desea salir sin guardar?`)
};

/**
* | output |
* | --- |
* | "You have unsaved changes. Leave without saving?" |
*
* @param {Intake_Forms_Discard_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_discard_confirm = /** @type {((inputs?: Intake_Forms_Discard_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Discard_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_discard_confirm(inputs)
	return es_intake_forms_discard_confirm(inputs)
});