/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Record_DisbursementsInputs */

const en_permission_record_disbursements = /** @type {(inputs: Permission_Record_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record disbursements`)
};

const es_permission_record_disbursements = /** @type {(inputs: Permission_Record_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrar desembolsos`)
};

const en_xa2_permission_record_disbursements = /** @type {(inputs: Permission_Record_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd dìsbùrsèmènts ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record disbursements" |
*
* @param {Permission_Record_DisbursementsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_record_disbursements = /** @type {((inputs?: Permission_Record_DisbursementsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Record_DisbursementsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_record_disbursements(inputs)
	if (locale === "en-XA") return en_xa2_permission_record_disbursements(inputs)
	return en_permission_record_disbursements(inputs)
});