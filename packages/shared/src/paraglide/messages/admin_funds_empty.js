/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_EmptyInputs */

const en_admin_funds_empty = /** @type {(inputs: Admin_Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No funds yet. Add one to start tracking balances.`)
};

const es_admin_funds_empty = /** @type {(inputs: Admin_Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavía no hay fondos. Añade uno para empezar a llevar los saldos.`)
};

const en_xa2_admin_funds_empty = /** @type {(inputs: Admin_Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fùnds yèt. Àdd ònè tò stàrt tràckìng bàlàncès. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No funds yet. Add one to start tracking balances." |
*
* @param {Admin_Funds_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_empty = /** @type {((inputs?: Admin_Funds_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_empty(inputs)
	return en_admin_funds_empty(inputs)
});