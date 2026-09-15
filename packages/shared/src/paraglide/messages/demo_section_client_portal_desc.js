/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Portal_DescInputs */

const en_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The secure portal lets a person who submitted an intake form continue the conversation with the organization. Access comes through a link sent by a volunteer, and the credential that unlocks the portal lives only in the URL fragment, which the browser never sends to the server.`)
};

const es_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El portal seguro permite que una persona que envió un formulario de admisión continúe la conversación con la organización. El acceso llega a través de un enlace enviado por un voluntario, y la credencial que desbloquea el portal vive solo en el fragmento de la URL, que el navegador nunca envía al servidor.`)
};

/**
* | output |
* | --- |
* | "The secure portal lets a person who submitted an intake form continue the conversation with the organization. Access comes through a link sent by a volunteer..." |
*
* @param {Demo_Section_Client_Portal_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_desc = /** @type {((inputs?: Demo_Section_Client_Portal_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Portal_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_portal_desc(inputs)
	return en_demo_section_client_portal_desc(inputs)
});