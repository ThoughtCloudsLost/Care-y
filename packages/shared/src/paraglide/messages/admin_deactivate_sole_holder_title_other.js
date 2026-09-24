/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Deactivate_Sole_Holder_Title_OtherInputs */

const en_admin_deactivate_sole_holder_title_other = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This user holds the only key to ${i?.count} tickets`)
};

const es_admin_deactivate_sole_holder_title_other = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este usuario tiene la única clave de ${i?.count} casos`)
};

const en_xa2_admin_deactivate_sole_holder_title_other = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs ùsèr hòlds thè ònly kèy tò  ••••••••••${i?.count} tìckèts •••⟧`)
};

/**
* | output |
* | --- |
* | "This user holds the only key to {count} tickets" |
*
* @param {Admin_Deactivate_Sole_Holder_Title_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_title_other = /** @type {((inputs: Admin_Deactivate_Sole_Holder_Title_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_Sole_Holder_Title_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate_sole_holder_title_other(inputs)
	if (locale === "en-XA") return en_xa2_admin_deactivate_sole_holder_title_other(inputs)
	return en_admin_deactivate_sole_holder_title_other(inputs)
});