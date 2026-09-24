/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Grace_PeriodInputs */

const en_admin_telephony_grace_period = /** @type {(inputs: Admin_Telephony_Grace_PeriodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changes may take a few minutes to take effect.`)
};

const es_admin_telephony_grace_period = /** @type {(inputs: Admin_Telephony_Grace_PeriodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los cambios pueden tardar unos minutos en surtir efecto.`)
};

const en_xa2_admin_telephony_grace_period = /** @type {(inputs: Admin_Telephony_Grace_PeriodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngès mày tàkè à fèw mìnùtès tò tàkè èffèct. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Changes may take a few minutes to take effect." |
*
* @param {Admin_Telephony_Grace_PeriodInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_grace_period = /** @type {((inputs?: Admin_Telephony_Grace_PeriodInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Grace_PeriodInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_grace_period(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_grace_period(inputs)
	return en_admin_telephony_grace_period(inputs)
});