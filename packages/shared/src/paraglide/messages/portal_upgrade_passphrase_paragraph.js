/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Upgrade_Passphrase_ParagraphInputs */

const en_portal_upgrade_passphrase_paragraph = /** @type {(inputs: Portal_Upgrade_Passphrase_ParagraphInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a password to your link, so the link alone is not enough to open your messages.`)
};

const es_portal_upgrade_passphrase_paragraph = /** @type {(inputs: Portal_Upgrade_Passphrase_ParagraphInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega una contraseña a tu enlace, para que el enlace por sí solo no baste para abrir tus mensajes.`)
};

/**
* | output |
* | --- |
* | "Add a password to your link, so the link alone is not enough to open your messages." |
*
* @param {Portal_Upgrade_Passphrase_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_passphrase_paragraph = /** @type {((inputs?: Portal_Upgrade_Passphrase_ParagraphInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Passphrase_ParagraphInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_passphrase_paragraph(inputs)
	return en_portal_upgrade_passphrase_paragraph(inputs)
});