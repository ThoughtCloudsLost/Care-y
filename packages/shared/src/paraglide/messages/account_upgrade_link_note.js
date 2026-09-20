/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Link_NoteInputs */

const en_account_upgrade_link_note = /** @type {(inputs: Account_Upgrade_Link_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link will stop working after you set up your account.`)
};

const es_account_upgrade_link_note = /** @type {(inputs: Account_Upgrade_Link_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace dejará de funcionar después de crear tu cuenta.`)
};

const en_xa2_account_upgrade_link_note = /** @type {(inputs: Account_Upgrade_Link_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk wìll stòp wòrkìng àftèr yòù sèt ùp yòùr àccòùnt. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link will stop working after you set up your account." |
*
* @param {Account_Upgrade_Link_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_link_note = /** @type {((inputs?: Account_Upgrade_Link_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Link_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_upgrade_link_note(inputs)
	if (locale === "en-XA") return en_xa2_account_upgrade_link_note(inputs)
	return en_account_upgrade_link_note(inputs)
});