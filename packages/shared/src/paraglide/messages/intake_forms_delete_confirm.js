/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Delete_ConfirmInputs */

const en_intake_forms_delete_confirm = /** @type {(inputs: Intake_Forms_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This will permanently delete this form and all its fields. This cannot be undone.`)
};

const es_intake_forms_delete_confirm = /** @type {(inputs: Intake_Forms_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esto eliminará permanentemente este formulario y todos sus campos. Esto no se puede deshacer.`)
};

const en_xa2_intake_forms_delete_confirm = /** @type {(inputs: Intake_Forms_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs wìll pèrmànèntly dèlètè thìs fòrm ànd àll ìts fìèlds. Thìs cànnòt bè ùndònè. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This will permanently delete this form and all its fields. This cannot be undone." |
*
* @param {Intake_Forms_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete_confirm = /** @type {((inputs?: Intake_Forms_Delete_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Delete_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_delete_confirm(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_delete_confirm(inputs)
	return en_intake_forms_delete_confirm(inputs)
});