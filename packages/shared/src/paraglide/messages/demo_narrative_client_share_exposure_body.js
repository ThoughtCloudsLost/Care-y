/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_Exposure_BodyInputs */

const en_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`**Privacy.** The server cannot read the share content because the decryption key lives in the URL fragment, which the browser never sends in a request. The share link's key is a fresh random value unrelated to any portal or account credential, so opening a share link does not connect the request to any other conversation the reader may have with the organization. The server does see the share ID and the IP address of the request.`)
};

const es_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`**Privacidad.** El servidor no puede leer el contenido compartido porque la clave de descifrado vive en el fragmento de la URL, que el navegador nunca envía en una solicitud. La clave del enlace compartido es un valor aleatorio nuevo sin relación con ninguna credencial de portal o cuenta, por lo que abrir un enlace compartido no conecta la solicitud con ninguna otra conversación que el lector pueda tener con la organización. El servidor sí ve el identificador de compartición y la dirección IP de la solicitud.`)
};

const en_xa2_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦**Prìvàcy. •••** Thè sèrvèr cànnòt rèàd thè shàrè còntènt bècàùsè thè dècryptìòn kèy lìvès ìn thè ÙRL fràgmènt, whìch thè bròwsèr nèvèr sènds ìn à rèqùèst. Thè shàrè lìnk's kèy ìs à frèsh ràndòm vàlùè ùnrèlàtèd tò àny pòrtàl òr àccòùnt crèdèntìàl, sò òpènìng à shàrè lìnk dòès nòt cònnèct thè rèqùèst tò àny òthèr cònvèrsàtìòn thè rèàdèr mày hàvè wìth thè òrgànìzàtìòn. Thè sèrvèr dòès sèè thè shàrè ÌD ànd thè ÌP àddrèss òf thè rèqùèst. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "**Privacy.** The server cannot read the share content because the decryption key lives in the URL fragment, which the browser never sends in a request. The s..." |
*
* @param {Demo_Narrative_Client_Share_Exposure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_exposure_body = /** @type {((inputs?: Demo_Narrative_Client_Share_Exposure_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_Exposure_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_exposure_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_exposure_body(inputs)
	return en_demo_narrative_client_share_exposure_body(inputs)
});