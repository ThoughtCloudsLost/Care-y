/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Idle_WarningInputs */

const en_account_idle_warning = /** @type {(inputs: Account_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your session will end soon due to inactivity. Any activity keeps it signed in.`)
};

const es_account_idle_warning = /** @type {(inputs: Account_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu sesión terminará pronto por inactividad. Cualquier actividad la mantiene activa.`)
};

/**
* | output |
* | --- |
* | "Your session will end soon due to inactivity. Any activity keeps it signed in." |
*
* @param {Account_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_idle_warning = /** @type {((inputs?: Account_Idle_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Idle_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_idle_warning(inputs)
	return es_account_idle_warning(inputs)
});