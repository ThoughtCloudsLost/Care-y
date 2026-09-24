/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Deactivate_Sole_Holder_Title_OneInputs */

const en_admin_deactivate_sole_holder_title_one = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This user holds the only key to ${i?.count} ticket`)
};

const es_admin_deactivate_sole_holder_title_one = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este usuario tiene la única clave de ${i?.count} caso`)
};

const en_xa2_admin_deactivate_sole_holder_title_one = /** @type {(inputs: Admin_Deactivate_Sole_Holder_Title_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs ùsèr hòlds thè ònly kèy tò  ••••••••••${i?.count} tìckèt •••⟧`)
};

/**
* | output |
* | --- |
* | "This user holds the only key to {count} ticket" |
*
* @param {Admin_Deactivate_Sole_Holder_Title_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_title_one = /** @type {((inputs: Admin_Deactivate_Sole_Holder_Title_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_Sole_Holder_Title_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate_sole_holder_title_one(inputs)
	if (locale === "en-XA") return en_xa2_admin_deactivate_sole_holder_title_one(inputs)
	return en_admin_deactivate_sole_holder_title_one(inputs)
});