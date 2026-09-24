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

const en_xa2_portal_upgrade_passphrase_paragraph = /** @type {(inputs: Portal_Upgrade_Passphrase_ParagraphInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à pàsswòrd tò yòùr lìnk, sò thè lìnk àlònè ìs nòt ènòùgh tò òpèn yòùr mèssàgès. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a password to your link, so the link alone is not enough to open your messages." |
*
* @param {Portal_Upgrade_Passphrase_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_passphrase_paragraph = /** @type {((inputs?: Portal_Upgrade_Passphrase_ParagraphInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Passphrase_ParagraphInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_passphrase_paragraph(inputs)
	if (locale === "en-XA") return en_xa2_portal_upgrade_passphrase_paragraph(inputs)
	return en_portal_upgrade_passphrase_paragraph(inputs)
});