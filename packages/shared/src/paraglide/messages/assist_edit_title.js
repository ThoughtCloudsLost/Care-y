/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_Edit_TitleInputs */

const en_assist_edit_title = /** @type {(inputs: Assist_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit disbursement`)
};

const es_assist_edit_title = /** @type {(inputs: Assist_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar desembolso`)
};

const en_xa2_assist_edit_title = /** @type {(inputs: Assist_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt dìsbùrsèmènt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit disbursement" |
*
* @param {Assist_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_edit_title = /** @type {((inputs?: Assist_Edit_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_Edit_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_edit_title(inputs)
	if (locale === "en-XA") return en_xa2_assist_edit_title(inputs)
	return en_assist_edit_title(inputs)
});