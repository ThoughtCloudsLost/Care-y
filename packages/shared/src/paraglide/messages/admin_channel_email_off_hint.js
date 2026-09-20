/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Email_Off_HintInputs */

const en_admin_channel_email_off_hint = /** @type {(inputs: Admin_Channel_Email_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers cannot send emails to clients.`)
};

const es_admin_channel_email_off_hint = /** @type {(inputs: Admin_Channel_Email_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios no pueden enviar correos electrónicos a los clientes.`)
};

const en_xa2_admin_channel_email_off_hint = /** @type {(inputs: Admin_Channel_Email_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs cànnòt sènd èmàìls tò clìènts. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteers cannot send emails to clients." |
*
* @param {Admin_Channel_Email_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_email_off_hint = /** @type {((inputs?: Admin_Channel_Email_Off_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Email_Off_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_email_off_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_channel_email_off_hint(inputs)
	return en_admin_channel_email_off_hint(inputs)
});