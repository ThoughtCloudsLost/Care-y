/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Portal_DescInputs */

const en_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The secure portal lets a client continue the conversation with the organization. Access comes through a link sent by a volunteer, and the credential that unlocks the portal lives only in the URL fragment, which the browser never sends to the server.`)
};

const es_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El portal seguro permite que un cliente continúe la conversación con la organización. El acceso llega a través de un enlace enviado por un voluntario, y la credencial que desbloquea el portal vive solo en el fragmento de la URL, que el navegador nunca envía al servidor.`)
};

const en_xa2_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sècùrè pòrtàl lèts à clìènt còntìnùè thè cònvèrsàtìòn wìth thè òrgànìzàtìòn. Àccèss còmès thròùgh à lìnk sènt by à vòlùntèèr, ànd thè crèdèntìàl thàt ùnlòcks thè pòrtàl lìvès ònly ìn thè ÙRL fràgmènt, whìch thè bròwsèr nèvèr sènds tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The secure portal lets a client continue the conversation with the organization. Access comes through a link sent by a volunteer, and the credential that unl..." |
*
* @param {Demo_Section_Client_Portal_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_desc = /** @type {((inputs?: Demo_Section_Client_Portal_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Portal_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_portal_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_portal_desc(inputs)
	return en_demo_section_client_portal_desc(inputs)
});