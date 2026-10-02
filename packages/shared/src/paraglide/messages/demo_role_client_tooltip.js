/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Client_TooltipInputs */

const en_demo_role_client_tooltip = /** @type {(inputs: Demo_Role_Client_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Person seeking help, not a member of the organization. Sees the public intake form, the secure portal, and the client account with no role or staff permission.`)
};

const es_demo_role_client_tooltip = /** @type {(inputs: Demo_Role_Client_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Persona que busca ayuda, no es miembro de la organización. Ve el formulario público de admisión, el portal seguro y la cuenta de cliente sin rol ni permiso del personal.`)
};

const en_xa2_demo_role_client_tooltip = /** @type {(inputs: Demo_Role_Client_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèrsòn sèèkìng hèlp, nòt à mèmbèr òf thè òrgànìzàtìòn. Sèès thè pùblìc ìntàkè fòrm, thè sècùrè pòrtàl, ànd thè clìènt àccòùnt wìth nò ròlè òr stàff pèrmìssìòn. ••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Person seeking help, not a member of the organization. Sees the public intake form, the secure portal, and the client account with no role or staff permission." |
*
* @param {Demo_Role_Client_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_client_tooltip = /** @type {((inputs?: Demo_Role_Client_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Client_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_client_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_client_tooltip(inputs)
	return en_demo_role_client_tooltip(inputs)
});