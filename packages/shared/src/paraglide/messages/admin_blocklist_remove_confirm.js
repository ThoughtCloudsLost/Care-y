/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Remove_ConfirmInputs */

const en_admin_blocklist_remove_confirm = /** @type {(inputs: Admin_Blocklist_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This number will no longer be blocked. Are you sure?`)
};

const es_admin_blocklist_remove_confirm = /** @type {(inputs: Admin_Blocklist_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Este número ya no estará bloqueado. Está seguro?`)
};

const en_xa2_admin_blocklist_remove_confirm = /** @type {(inputs: Admin_Blocklist_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs nùmbèr wìll nò lòngèr bè blòckèd. Àrè yòù sùrè? ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This number will no longer be blocked. Are you sure?" |
*
* @param {Admin_Blocklist_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_remove_confirm = /** @type {((inputs?: Admin_Blocklist_Remove_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Remove_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_remove_confirm(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_remove_confirm(inputs)
	return en_admin_blocklist_remove_confirm(inputs)
});