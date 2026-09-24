/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Upgrade_TitleInputs */

const en_portal_upgrade_title = /** @type {(inputs: Portal_Upgrade_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Make your messages more secure`)
};

const es_portal_upgrade_title = /** @type {(inputs: Portal_Upgrade_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Haz tus mensajes más seguros`)
};

const en_xa2_portal_upgrade_title = /** @type {(inputs: Portal_Upgrade_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màkè yòùr mèssàgès mòrè sècùrè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Make your messages more secure" |
*
* @param {Portal_Upgrade_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_title = /** @type {((inputs?: Portal_Upgrade_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_title(inputs)
	if (locale === "en-XA") return en_xa2_portal_upgrade_title(inputs)
	return en_portal_upgrade_title(inputs)
});