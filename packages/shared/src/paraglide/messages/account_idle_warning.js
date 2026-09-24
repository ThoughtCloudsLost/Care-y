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

const en_xa2_account_idle_warning = /** @type {(inputs: Account_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr sèssìòn wìll ènd sòòn dùè tò ìnàctìvìty. Àny àctìvìty kèèps ìt sìgnèd ìn. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your session will end soon due to inactivity. Any activity keeps it signed in." |
*
* @param {Account_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_idle_warning = /** @type {((inputs?: Account_Idle_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Idle_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_idle_warning(inputs)
	if (locale === "en-XA") return en_xa2_account_idle_warning(inputs)
	return en_account_idle_warning(inputs)
});