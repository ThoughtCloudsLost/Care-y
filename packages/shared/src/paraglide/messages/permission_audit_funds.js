/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Audit_FundsInputs */

const en_permission_audit_funds = /** @type {(inputs: Permission_Audit_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audit fund ledger`)
};

const es_permission_audit_funds = /** @type {(inputs: Permission_Audit_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auditar el libro de fondos`)
};

const en_xa2_permission_audit_funds = /** @type {(inputs: Permission_Audit_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùdìt fùnd lèdgèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Audit fund ledger" |
*
* @param {Permission_Audit_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_audit_funds = /** @type {((inputs?: Permission_Audit_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Audit_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_audit_funds(inputs)
	if (locale === "en-XA") return en_xa2_permission_audit_funds(inputs)
	return en_permission_audit_funds(inputs)
});