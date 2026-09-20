/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Followup_Not_EditableInputs */

const en_error_followup_not_editable = /** @type {(inputs: Error_Followup_Not_EditableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This follow-up cannot be edited.`)
};

const es_error_followup_not_editable = /** @type {(inputs: Error_Followup_Not_EditableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este seguimiento no se puede editar.`)
};

const en_xa2_error_followup_not_editable = /** @type {(inputs: Error_Followup_Not_EditableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòllòw-ùp cànnòt bè èdìtèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This follow-up cannot be edited." |
*
* @param {Error_Followup_Not_EditableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_editable = /** @type {((inputs?: Error_Followup_Not_EditableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Followup_Not_EditableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_followup_not_editable(inputs)
	if (locale === "en-XA") return en_xa2_error_followup_not_editable(inputs)
	return en_error_followup_not_editable(inputs)
});