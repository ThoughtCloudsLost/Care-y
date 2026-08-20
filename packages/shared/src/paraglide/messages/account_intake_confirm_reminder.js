/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ username: NonNullable<unknown> }} Account_Intake_Confirm_ReminderInputs */

const en_account_intake_confirm_reminder = /** @type {(inputs: Account_Intake_Confirm_ReminderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Your username is ${i?.username}. Sign in any time at /account on this site. Your password is never shown or sent anywhere.`)
};

const es_account_intake_confirm_reminder = /** @type {(inputs: Account_Intake_Confirm_ReminderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tu nombre de usuario es ${i?.username}. Inicia sesión en cualquier momento en /account en este sitio. Tu contraseña nunca se muestra ni se envía a ningún lado.`)
};

/**
* | output |
* | --- |
* | "Your username is {username}. Sign in any time at /account on this site. Your password is never shown or sent anywhere." |
*
* @param {Account_Intake_Confirm_ReminderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_intake_confirm_reminder = /** @type {((inputs: Account_Intake_Confirm_ReminderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Intake_Confirm_ReminderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_intake_confirm_reminder(inputs)
	return es_account_intake_confirm_reminder(inputs)
});