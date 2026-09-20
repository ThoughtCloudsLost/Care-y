/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Upgrade_BodyInputs */

const en_portal_upgrade_body = /** @type {(inputs: Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages are encrypted, and the key travels inside your secure link. That also means anyone who gets your link can read them. You can protect them further in two ways.`)
};

const es_portal_upgrade_body = /** @type {(inputs: Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus mensajes están cifrados y la clave viaja dentro de tu enlace seguro. Eso también significa que cualquier persona que consiga tu enlace puede leerlos. Puedes protegerlos aún más de dos maneras.`)
};

const en_xa2_portal_upgrade_body = /** @type {(inputs: Portal_Upgrade_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr mèssàgès àrè èncryptèd, ànd thè kèy tràvèls ìnsìdè yòùr sècùrè lìnk. Thàt àlsò mèàns ànyònè whò gèts yòùr lìnk càn rèàd thèm. Yòù càn pròtèct thèm fùrthèr ìn twò wàys. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your messages are encrypted, and the key travels inside your secure link. That also means anyone who gets your link can read them. You can protect them furth..." |
*
* @param {Portal_Upgrade_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_body = /** @type {((inputs?: Portal_Upgrade_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_body(inputs)
	if (locale === "en-XA") return en_xa2_portal_upgrade_body(inputs)
	return en_portal_upgrade_body(inputs)
});