/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ url: NonNullable<unknown> }} Portal_Upgrade_Account_ParagraphInputs */

const en_portal_upgrade_account_paragraph = /** @type {(inputs: Portal_Upgrade_Account_ParagraphInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Or create an account and sign in at ${i?.url} instead, so you no longer depend on the link at all. With an account, losing the link no longer means losing access to your messages and support.`)
};

const es_portal_upgrade_account_paragraph = /** @type {(inputs: Portal_Upgrade_Account_ParagraphInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`O crea una cuenta e inicia sesión en ${i?.url}, para que ya no dependas del enlace. Con una cuenta, perder el enlace ya no significa perder el acceso a tus mensajes y a tu apoyo.`)
};

/**
* | output |
* | --- |
* | "Or create an account and sign in at {url} instead, so you no longer depend on the link at all. With an account, losing the link no longer means losing access..." |
*
* @param {Portal_Upgrade_Account_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_account_paragraph = /** @type {((inputs: Portal_Upgrade_Account_ParagraphInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Account_ParagraphInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_account_paragraph(inputs)
	return en_portal_upgrade_account_paragraph(inputs)
});